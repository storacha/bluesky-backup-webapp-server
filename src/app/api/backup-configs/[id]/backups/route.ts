import { getStorageContext } from '@/lib/server/db'

// NEEDS AUTHORIZATION

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()

  const { results } = await db.findSnapshots(id)

  return Response.json(results)
}
