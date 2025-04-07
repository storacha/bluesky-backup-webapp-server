'use server'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { redirect } from 'next/navigation'

export const action = async (data: FormData) => {
  const {
    env: { DB },
  } = getCloudflareContext()

  await DB.prepare(
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
    .run()

  redirect('/')
}
