import { getSession } from '@/lib/sessions'
import { getStorageContext } from '@/lib/server/db'

// NEEDS AUTHORIZATION

export async function GET() {
  const { db } = getStorageContext()
  const { did } = await getSession()
  if (!did) {
    return new Response('Not authorized', { status: 401 })
  }

  const { results } = await db.findBackups(did)

  return Response.json(results)
}
