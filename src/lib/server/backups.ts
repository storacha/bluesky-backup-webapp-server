'use server'

import { Agent as AtprotoAgent } from '@atproto/api'
import { AgentData } from '@storacha/access/agent'
import { Client as StorachaClient } from '@storacha/client'
import { Delegation, DID, Signer } from '@ucanto/interface'

import { receiptsEndpoint, serviceConnection } from '@/components/services'
import { createClient as createAtprotoClient } from '@/lib/atproto'
import { getServerIdentity } from '@/lib/server/auth'
import { BBDatabase } from '@/lib/server/db'
import { Backup } from '@/types'

import { uploadCAR } from '../storacha'

export const createSnapshotForBackup = async (
  db: BBDatabase,
  account: string,
  backup: Backup,
  delegation: Delegation
) => {
  const snapshot = await db.addSnapshot({
    backupId: backup.id,
    atprotoAccount: backup.atprotoAccount,
  })

  if (!snapshot) {
    throw new Error('Failed to create snapshot')
  }

  const atpClient = await createAtprotoClient({
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

  // kick off a process that will continue after this function returns
  void doSnapshot(snapshot.id, db, atpAgent, storachaClient, {
    backupId: backup.id,
  })
  return snapshot
}

async function isBlobAlreadyBackedUp (db: BBDatabase, cid: string, backupId?: string) {
  if (backupId) {
    const { result: existingBlob } = await db.getBlobInBackup(cid, backupId)
    return Boolean(existingBlob)
  } else {
    return false
  }
}

interface BackupOptions {
  backupId?: string
}

const doSnapshot = async (
  snapshotId: string,
  db: BBDatabase,
  atpAgent: AtprotoAgent,
  storachaClient: StorachaClient,
  options: BackupOptions = {}
): Promise<void> => {
  if (!atpAgent.did) {
    throw new Error('No DID found in atproto agent')
  }
  // if no backup id this is a "quick snapshot"
  const quickSnapshot = !options.backupId
  const { result: backup } = options.backupId
    ? await db.findBackup(options.backupId)
    : {}

  if (quickSnapshot || backup?.includeRepository) {
    try {
      await db.updateSnapshot(snapshotId, { repositoryStatus: 'in-progress' })

      // TODO: It would be much better to stream this data, but the atproto client
      // doesn't provide a way to do that yet. It absolutely could, but right now
      // `XrpcClient.call` always consumes the entire response into memory.
      const repoRes = await atpAgent.com.atproto.sync.getRepo({
        did: atpAgent.did,
      })

      if (!repoRes.success) {
        throw new Error('Failed to get repo')
      }

      const repoRoot = await uploadCAR(storachaClient, new Blob([repoRes.data]))
      await db.updateSnapshot(snapshotId, {
        repositoryStatus: 'success',
        repositoryCid: repoRoot.toString(),
      })
    } catch (e: unknown) {
      // @ts-expect-error e.cause doesn't typecheck
      console.error('Error while creating backup', e, e.cause)
      await db.updateSnapshot(snapshotId, { repositoryStatus: 'failed' })
    }
  }
  if (quickSnapshot || backup?.includeBlobs) {
    try {
      await db.updateSnapshot(snapshotId, { blobsStatus: 'in-progress' })

      let blobsRes
      do {
        blobsRes = await atpAgent.com.atproto.sync.listBlobs({
          did: atpAgent.did,
          cursor: blobsRes?.data.cursor,
        })
        // TODO handle blobsRes.success == false
        for (const cid of blobsRes.data.cids) {
          // only try to sync this blob if we've seen it before
          if (await isBlobAlreadyBackedUp(db, cid, options.backupId)) {
            console.log('already backed up blob', cid, 'for backup', options.backupId, ', skipping')
          } else {
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
        }
      } while (blobsRes.data.cursor)

      await db.updateSnapshot(snapshotId, { blobsStatus: 'success' })
    } catch (e: unknown) {
      // @ts-expect-error e.cause doesn't typecheck
      console.error('Error while creating backup', e, e.cause)
      await db.updateSnapshot(snapshotId, { blobsStatus: 'failed' })
    }
  }
}
