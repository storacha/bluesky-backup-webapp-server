'use server'

import { Delegation } from '@ucanto/core'

import { createSnapshotForBackup } from '@/lib/server/backups'
import { getStorageContext } from '@/lib/server/db'
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
    return new Response('Could not find backup', { status: 400 })
  }
  await createSnapshotForBackup(db, account, backup, delegation)
  return backup
}
