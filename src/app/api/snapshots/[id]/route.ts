import { getStorageContext } from '@/lib/server/db'

// NEEDS AUTHORIZATION

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()

  const { result } = await db.findSnapshot(parseInt(id))

  return Response.json(result)
}
