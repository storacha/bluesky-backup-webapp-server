import { NextResponse } from 'next/server'

import { backupOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { did: account } = await getSession()
    if (!account) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return new NextResponse('Invalid name', { status: 400 })
    }

    const { db } = getStorageContext()
    if (!(await backupOwnedByAccount(db, params.id, account))) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const backup = await db.updateBackup(params.id, { name })
    return NextResponse.json(backup)
  } catch (error) {
    console.error('Failed to update backup name:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 