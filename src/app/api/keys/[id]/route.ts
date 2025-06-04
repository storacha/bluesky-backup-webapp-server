import { NextRequest } from 'next/server'

import { rotationKeyOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { did: storachaAccount } = await getSession()
  const { db } = getStorageContext()
  if (!(await rotationKeyOwnedByAccount(db, id, storachaAccount))) {
    return new Response('Not authorized', { status: 401 })
  }

  await db.deleteRotationKey(id)
  return Response.json({})
}
