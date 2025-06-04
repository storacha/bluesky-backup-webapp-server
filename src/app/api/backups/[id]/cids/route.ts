import { NextRequest } from 'next/server'

import { backupOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!(await backupOwnedByAccount(db, id, account)))
    return new Response('Not authorized', { status: 401 })

  const data = await db.getAllCidsInBackup(id)
  return Response.json(data)
}
