'use server'

import { getStorageContext } from '@/lib/server/db'

export const createBackup = async () => {
  const { db } = getStorageContext()

  const backupConfig = db.addBackup({
    backup_configs_id: 1,
    repository_cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551repo',
    blobs_cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551blob',
    preferences_cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551pref'
  })

  if (!backupConfig) {
    throw new Error('Failed to create backup config')
  }
}
