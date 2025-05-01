import { snapshotOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!(await snapshotOwnedByAccount(db, id, account))) {
    return new Response('Not authorized', { status: 401 })
  }

  const { results } = await db.findBlobsForSnapshot(id)

  return Response.json(results)
}
