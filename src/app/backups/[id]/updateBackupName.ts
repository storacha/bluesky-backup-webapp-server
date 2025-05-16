'use server'

import { backupOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export const updateBackupName = async (backupId: string, newName: string) => {
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  
  if (!account) {
    throw new Error('Not authorized')
  }

  if (!(await backupOwnedByAccount(db, backupId, account))) {
    throw new Error('Unauthorized')
  }

  const { result: backup } = await db.findBackup(backupId)
  if (!backup) {
    throw new Error('Backup not found')
  }

  await db.updateBackup(backupId, { name: newName })
  return { success: true }
} 