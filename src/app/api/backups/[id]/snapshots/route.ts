import { backupOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

// NEEDS AUTHORIZATION

export async function GET (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!await backupOwnedByAccount(db, parseInt(id), account)) {
    return new Response('Not authorized', { status: 401 })
  }
  const { results } = await db.findSnapshots(parseInt(id))

  return Response.json(results)
}

export async function POST (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!await backupOwnedByAccount(db, parseInt(id), account)) {
    return new Response('Not authorized', { status: 401 })
  }
  const { results } = await db.findSnapshots(parseInt(id))

  return Response.json(results)
}