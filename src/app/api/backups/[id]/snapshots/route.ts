import { backupOwnedByAccount, isBasicAuthed } from '@/lib/server/auth'
import { createSnapshotForBackup } from '@/lib/server/backups'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'
import { cidUrl } from '@/lib/storacha'
import { Delegation } from '@ucanto/core'

export async function GET (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!await backupOwnedByAccount(db, parseInt(id), account)) {
    return new Response('Not authorized', { status: 401 })
  }
  const { results } = await db.findSnapshots(parseInt(id))

  return Response.json(results)
}

export async function POST (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isBasicAuthed(request)){
    return new Response('Unauthorized', {status: 401})
  }

  const { id: idStr } = await params
  const id = parseInt(idStr)
  const { db } = getStorageContext()
  const { result: backup } = await db.findBackup(id)

  if (backup?.delegationCid) {
    console.log("Fetching delegation ", cidUrl(backup?.delegationCid))
    const delegationResponse = await fetch(cidUrl(backup?.delegationCid))

    if (delegationResponse.body) {
      const delegationResult = await Delegation.extract(new Uint8Array(await delegationResponse.arrayBuffer()))
      if (delegationResult.error) {
        console.error(delegationResult.error)
        return new Response('Invalid UCAN', { status: 400 })
      }
      const result = await createSnapshotForBackup(db, backup.accountDid, backup, delegationResult.ok)
      if (result instanceof Response) {
        console.error('error backing up', result)
        return result
      } else {
        return new Response('success!')
      }
    } else {
      return new Response('Could not fetch delegation from Storacha', {status: 500})
    }
  } else {
    return new Response('No delegation configured', { status: 400 })
  }
}