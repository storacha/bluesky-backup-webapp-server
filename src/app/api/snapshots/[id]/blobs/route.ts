import { NextRequest } from 'next/server'

import { NEXT_PUBLIC_APP_URI } from '@/lib/constants'
import { snapshotOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()

  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 10)
  if (!(await snapshotOwnedByAccount(db, id, account))) {
    return new Response('Not authorized', { status: 401 })
  }

  const data = await db.findBlobsForSnapshot(id, { limit, page })
  const count = data.count
  const totalPages = Math.ceil(count / limit)
  const getPageUrl = (pageNumber: number) =>
    `${NEXT_PUBLIC_APP_URI}/api/snapshots/${id}/blobs?page=${pageNumber}&limit=${limit}`

  return Response.json({
    ...data,
    next: page < totalPages ? getPageUrl(page + 1) : null,
    prev: page > 1 ? getPageUrl(page - 1) : null,
  })
}
