'use server'

import { AgentData } from '@storacha/access/agent'
import { Client as StorachaClient } from '@storacha/client'
import { DID, Signer } from '@ucanto/interface'
import { Agent as AtprotoAgent } from '@atproto/api'
import { Delegation } from '@ucanto/core'
import { BBDatabase, getStorageContext } from '@/lib/server/db'
import { createClient as createAtprotoClient } from '@/lib/atproto'
import { getSession } from '@/lib/sessions'
import { serverIdentity } from '@/lib/server/auth'
import { receiptsEndpoint, serviceConnection } from '@/components/services'

export const createBackup = async ({
  configId,
  delegationData,
}: {
  configId: number
  delegationData: Uint8Array
}) => {
  const { db } = getStorageContext()

  const { did: account } = await getSession()
  if (!account) {
    return new Response('Not authorized', { status: 401 })
  }

  const delegationResult = await Delegation.extract(delegationData)
  if (delegationResult.error) {
    console.error(delegationResult.error)
    return new Response('Invalid UCAN', { status: 400 })
  }
  const delegation = delegationResult.ok

  const { result: backupConfig } = await db.findBackupConfig(configId, account)
  if (!backupConfig) {
    return new Response('Not authorized', { status: 401 })
  }

  const backup = await db.addBackup({ backup_config_id: backupConfig.id })

  if (!backup) {
    throw new Error('Failed to create backup config')
  }

  const atpClient = createAtprotoClient({
    account,
  })
  const atpSession = await atpClient.restore(backupConfig.atproto_account)
  const atpAgent = new AtprotoAgent(atpSession)

  // Create AgentData manually because we don't want to use a store.
  const agentData = new AgentData({
    // FIXME: The Storacha client thinks a principal has to be a `did:key`,
    // which is a bit silly. All DIDs have keys, and any `Signer` by
    // definition has its private key loaded and can sign.
    principal: serverIdentity as unknown as Signer<DID<'key'>>,
    delegations: new Map(),
    meta: {
      name: 'bluesky-backups',
      type: 'service',
      description: 'Bluesky Backups Service',
    },
    spaces: new Map(),
    currentSpace: backupConfig.storacha_space,
  })

  const storachaClient = new StorachaClient(agentData, {
    serviceConf: {
      access: serviceConnection,
      upload: serviceConnection,
      filecoin: serviceConnection,

      // TODO: This should point to the gateway, but we don't actually use it
      // (yet), so we'll leave a dummy implementation here for now.
      gateway: {
        ...serviceConnection,
        execute() {
          throw new Error('Gateway connection not implemented')
        },
      },
    },
    receiptsEndpoint,
  })
  storachaClient.addProof(delegation)

  void doBackup(backup.id, db, atpAgent, storachaClient)

  return backup
}

const doBackup = async (
  backupId: number,
  db: BBDatabase,
  atpAgent: AtprotoAgent,
  storachaClient: StorachaClient
) => {
  try {
    await db.updateBackup(backupId, { repository_status: 'in-progress' })

    if (!atpAgent.did) {
      throw new Error('No DID found in atproto agent')
    }

    // TODO: It would be much better to stream this data, but the atproto client
    // doesn't provide a way to do that yet. It absolutely could, but right now
    // `XrpcClient.call` always consumes the entire response into memory.
    const repoRes = await atpAgent.com.atproto.sync.getRepo({
      did: atpAgent.did,
    })

    if (!repoRes.success) {
      throw new Error('Failed to get repo')
    }

    const repoRoot = await storachaClient.uploadCAR(new Blob([repoRes.data]), {
      // set shard size to 4 GiB - the maximum shard size
      shardSize: 1024 * 1024 * 1024 * 4,
    })
    await db.updateBackup(backupId, {
      repository_status: 'success',
      repository_cid: repoRoot.toString(),
    })
  } catch (e) {
    console.error('Error while creating backup', e)
    await db.updateBackup(backupId, { repository_status: 'failed' })
  }
}
