import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const { did: storachaAccount } = await getSession()
  if (!storachaAccount) return new Response('Not authorized', { status: 401 })
  const { db } = getStorageContext()

  const { results: keys } = await db.findRotationKeys(storachaAccount)
  return Response.json(keys)
}
