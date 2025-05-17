'use server'
import { getStorageContext } from '@/lib/server/db'

export async function deleteBackup(backupId: string) {
  try {
    const { db } = getStorageContext()
    db.deleteBackup(backupId)
    return { success: true }
  } catch (error) {
    console.error("Couldn't delete this backup", error)
    return { success: false, error: (error as Error).message }
  }
}
