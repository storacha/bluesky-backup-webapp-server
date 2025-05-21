import { NextRequest } from 'next/server'

import { PAGINATED_RESULTS_LIMIT } from '@/lib/constants'
import { backupOwnedByAccount } from '@/lib/server/auth'
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
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? PAGINATED_RESULTS_LIMIT)
  if (!(await backupOwnedByAccount(db, id, account))) {
    return new Response('Not authorized', { status: 401 })
  }
  const data = await db.findBlobsForBackup(id, { page, limit })
  const count = data.count
  const totalPages = Math.ceil(count / limit)
  const getPageUrl = (pageNumber: number) =>
    `${process.env.NEXT_PUBLIC_APP_URI!}/api/backups/${id}/blobs?page=${pageNumber}&limit=${limit}`

  return Response.json({
    ...data,
    next: page < totalPages ? getPageUrl(page + 1) : null,
    prev: page > 1 ? getPageUrl(page - 1) : null,
  })
}
