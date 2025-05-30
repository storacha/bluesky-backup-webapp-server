import { snapshotOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

// NEEDS AUTHORIZATION

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

  const { result } = await db.findSnapshot(id)

  return Response.json(result)
}
