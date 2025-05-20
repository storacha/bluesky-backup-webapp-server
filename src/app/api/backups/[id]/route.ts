import { backupOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'
import { backupInputUpdateSchema } from '@/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { did: account } = await getSession()
    const { db } = getStorageContext()

    if (!account || !(await backupOwnedByAccount(db, id, account))) {
      return new Response('Unauthorized', { status: 401 })
    }

    const parsed = backupInputUpdateSchema.safeParse(await request.json())

    if (!parsed.success) {
      return new Response('Invalid input', { status: 400 })
    }

    const backup = await db.updateBackup(id, parsed.data)
    return Response.json(backup)
  } catch (error) {
    console.error('Failed to update backup:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
