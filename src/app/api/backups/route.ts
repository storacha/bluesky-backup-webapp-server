import { getSession } from '@/lib/sessions'
import { getStorageContext } from '@/lib/server/db'

export async function GET() {
  const { db } = getStorageContext()
  const { did } = await getSession()
  if (!did) {
    return new Response('Not authorized', { status: 401 })
  }

  const { results } = await db.findBackups(did)

  return Response.json(results)
}

export async function POST() {
  // const { db } = getStorageContext()
  // TODO: verify basic auth and then figure out which backups to run

  

  return Response.json({})
}