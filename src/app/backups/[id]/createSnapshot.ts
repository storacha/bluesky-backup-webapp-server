'use server'

import { Agent as AtprotoAgent } from '@atproto/api'
import { AgentData } from '@storacha/access/agent'
import { Client as StorachaClient } from '@storacha/client'
import { Delegation } from '@ucanto/core'
import { DID, Signer } from '@ucanto/interface'

import { receiptsEndpoint, serviceConnection } from '@/components/services'
import { createClient as createAtprotoClient } from '@/lib/atproto'
import { getServerIdentity } from '@/lib/server/auth'
import { BBDatabase, getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export const createSnapshot = async ({
  backupId,
  delegationData,
}: {
  backupId: number
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
  const { result: backup } = await db.findBackup(backupId)
  if (!backup) {
    return new Response('Not authorized', { status: 401 })
  }

  const snapshot = await db.addSnapshot({
    backupId: backup.id,
    atprotoAccount: backup.atprotoAccount,
  })

  if (!snapshot) {
    throw new Error('Failed to create snapshot')
  }

  const atpClient = createAtprotoClient({
    account,
  })
  const atpSession = await atpClient.restore(backup.atprotoAccount)
  const atpAgent = new AtprotoAgent(atpSession)

  // Create AgentData manually because we don't want to use a store.
  const agentData = new AgentData({
    // FIXME: The Storacha client thinks a principal has to be a `did:key`,
    // which is a bit silly. All DIDs have keys, and any `Signer` by
    // definition has its private key loaded and can sign.
    principal: getServerIdentity() as unknown as Signer<DID<'key'>>,
    delegations: new Map(),
    meta: {
      name: 'bluesky-backups',
      type: 'service',
      description: 'Bluesky Backups Service',
    },
    spaces: new Map(),
    currentSpace: backup.storachaSpace,
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

  void doSnapshot(backup.id, db, atpAgent, storachaClient, {
    backupId: backup.id,
  })

  return backup
}

interface BackupOptions {
  backupId?: number
}

const doSnapshot = async (
  snapshotId: number,
  db: BBDatabase,
  atpAgent: AtprotoAgent,
  storachaClient: StorachaClient,
  options: BackupOptions = {}
) => {
  try {
    await db.updateSnapshot(snapshotId, { repositoryStatus: 'in-progress' })

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
    await db.updateSnapshot(snapshotId, {
      repositoryStatus: 'success',
      repositoryCid: repoRoot.toString(),
    })

    let blobsRes
    do {
      blobsRes = await atpAgent.com.atproto.sync.listBlobs({
        did: atpAgent.did,
        cursor: blobsRes?.data.cursor,
      })
      // TODO handle blobsRes.success == false
      for (const cid of blobsRes.data.cids) {
        const blobRes = await atpAgent.com.atproto.sync.getBlob({
          did: atpAgent.did,
          cid,
        })
        // TODO handle blobRes.success == false

        const uploadCid = await storachaClient.uploadFile(
          new Blob([blobRes.data])
        )
        // TODO: figure out how to fail if cid and uploadCid don't match
        console.log(
          `Uploaded blob with CID ${cid} and got ${uploadCid} from Storacha - these should be the same`
        )
        await db.addBlob({
          cid,
          contentType: blobRes.headers['content-type'],
          snapshotId: snapshotId,
          backupId: options.backupId,
        })
      }
    } while (blobsRes.data.cursor)
  } catch (e: unknown) {
    // @ts-expect-error e.cause doesn't typecheck
    console.error('Error while creating backup', e, e.cause)
    await db.updateSnapshot(snapshotId, { repositoryStatus: 'failed' })
  }
}
