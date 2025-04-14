import { BackupConfig } from '@/app/types'
import { getSession } from '@/lib/sessions'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// NEEDS UCAN AUTHORIZATION

export async function GET() {
  const {
    env: { DB },
  } = getCloudflareContext()
  const { did } = await getSession()
  if (!did) {
    return new Response('Not authorized', { status: 401 })
  }

  const { results } = await DB.prepare(
    /* sql */ `
      SELECT id,
        name,
        bluesky_account,
        storacha_space,
        include_repository,
        include_blobs,
        include_preferences,
        created_at
      
       FROM backup_configs
       WHERE account_did = ?
    `
  )
    .bind(did)
    .all<BackupConfig>()

  return Response.json(results)
}
