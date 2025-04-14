'use server'

import { getCloudflareContext } from '@opennextjs/cloudflare'

export const createBackup = async () => {
  const {
    env: { DB },
  } = getCloudflareContext()

  const backupConfig = await DB.prepare(
    /* sql */ `
    INSERT INTO backups (
      backup_configs_id,
      repository_cid,
      blobs_cid,
      preferences_cid
    )
    VALUES(?, ?, ?, ?)
    RETURNING id
  `
  )
    .bind(
      1,
      'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551repo',
      'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551blob',
      'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551pref'
    )
    .first()

  if (!backupConfig) {
    throw new Error('Failed to create backup config')
  }
}
