import { BackupConfig } from '@/app/types'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// NEEDS UCAN AUTHORIZATION

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const {
    env: { DB },
  } = getCloudflareContext()

  const { results } = await DB.prepare(
    /* sql */ `
      SELECT id,
        backup_config_id,
        repository_cid,
        blobs_cid,
        preferences_cid,
        created_at
      
       FROM backups

      WHERE backup_config_id = ?

      -- TODO: Fetch configs for correct account
    `
  )
    .bind(id)
    .all<BackupConfig>()

  return Response.json(results)
}
