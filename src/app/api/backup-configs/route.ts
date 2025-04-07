import { BackupConfig } from '@/app/types'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// NEEDS UCAN AUTHORIZATION

export async function GET() {
  const {
    env: { DB },
  } = getCloudflareContext()

  const { results } = await DB.prepare(
    /* sql */ `
      SELECT id,
        name,
        bluesky_account,
        storacha_space,
        include_repository,
        include_blobs,
        include_preferences
      
       FROM backup_configs
      -- TODO: Fetch configs for correct account
      -- WHERE account_did = ?
    `
  ).all<BackupConfig>()

  return Response.json(results)
}
