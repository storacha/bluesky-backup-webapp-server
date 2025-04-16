'use server'

import { getCloudflareContext } from '@/lib/cloudflare'
import { redirect } from 'next/navigation'

export const action = async (data: FormData) => {
  const {
    env: { DB },
  } = getCloudflareContext()

  const backupConfig = await DB.prepare(
    /* sql */ `
    INSERT INTO backup_configs (
      account_did,
      name,
      bluesky_account,
      storacha_space,
      include_repository,
      include_blobs,
      include_preferences
    )
    VALUES(?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `
  )
    .bind(
      data.get('account'),
      data.get('name'),
      data.get('bluesky_account'),
      data.get('storacha_space'),
      data.get('include_repository') === 'on' ? true : false,
      data.get('include_blobs') === 'on' ? true : false,
      data.get('include_preferences') === 'on' ? true : false
    )
    .first()

  if (!backupConfig) {
    throw new Error('Failed to create backup config')
  }

  redirect(`/configs/${backupConfig.id}`) // Redirect to the new config page
}
