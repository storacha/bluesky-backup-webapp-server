import { backupOwnedByAccount, isCronjobAuthed } from '@/lib/server/auth'
import { createSnapshotForBackup } from '@/lib/server/backups'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'
import { cidUrl } from '@/lib/storacha'
import { Delegation } from '@ucanto/core'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!(await backupOwnedByAccount(db, id, account))) {
    return new Response('Not authorized', { status: 401 })
  }
  const { results } = await db.findSnapshots(id)

  return Response.json(results)
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

  const delegationResponse = await fetch(cidUrl(backup?.delegationCid))

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
