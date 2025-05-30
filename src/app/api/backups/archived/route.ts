import { NextRequest } from 'next/server'

import { PAGINATED_RESULTS_LIMIT } from '@/lib/constants'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function GET(request: NextRequest) {
  const { db } = getStorageContext()
  const { did } = await getSession()
  if (!did) return new Response('Not authenticated', { status: 401 })

  const searchParams = request.nextUrl.searchParams
  const limit = Number(searchParams.get('limit') || PAGINATED_RESULTS_LIMIT)
  const page = Number(searchParams.get('page'))

  const data = await db.findArchivedBackups(did)
  const count = data.count
  const totalPages = Math.ceil(count / limit)
  const getPageUrl = (pageNumber: number) =>
    `${process.env.NEXT_PUBLIC_APP_URI!}/api/backups/archived?page=${pageNumber}&limit=${limit}`

  return Response.json({
    ...data,
    next: page < totalPages ? getPageUrl(page + 1) : null,
    prev: page > 1 ? getPageUrl(page - 1) : null,
  })
}
