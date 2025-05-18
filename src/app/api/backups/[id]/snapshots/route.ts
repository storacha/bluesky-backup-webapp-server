import { Delegation } from '@ucanto/core'
import { NextRequest } from 'next/server'

import { backupOwnedByAccount, isCronjobAuthed } from '@/lib/server/auth'
import { createSnapshotForBackup } from '@/lib/server/backups'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'
import { cidUrl } from '@/lib/storacha'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()

  const searchParams = request.nextUrl.searchParams
  const limit = Number(searchParams.get('limit') ?? 10)
  const page = Number(searchParams.get('page') ?? 1)
  if (!(await backupOwnedByAccount(db, id, account))) {
    return new Response('Not authorized', { status: 401 })
  }
  const data = await db.findSnapshots(id, { limit, page })

  return Response.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCronjobAuthed(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params
  const { db } = getStorageContext()
  const { result: backup } = await db.findBackup(id)

  if (!backup?.delegationCid) {
    return new Response('No delegation configured', { status: 400 })
  }

  const delegationResponse = await fetch(cidUrl(backup.delegationCid))

  if (!delegationResponse.body) {
    return new Response('Could not fetch delegation from Storacha', {
      status: 500,
    })
  }

  const delegationResult = await Delegation.extract(
    new Uint8Array(await delegationResponse.arrayBuffer())
  )
  if (delegationResult.error) {
    console.error(delegationResult.error)
    return new Response('Invalid UCAN', { status: 400 })
  }
  const snapshot = await createSnapshotForBackup(
    db,
    backup.accountDid,
    backup,
    delegationResult.ok
  )
  return Response.json(snapshot)
}
