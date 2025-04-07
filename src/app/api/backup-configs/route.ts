import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET() {
  const {
    env: { DB },
  } = getCloudflareContext()

  const { results } = await DB.prepare(
    /* sql */ `
      SELECT * FROM backup_configs
    `
  ).all()

  return Response.json({ backupConfigs: results.map((row) => row.name) })
}
