'use server'

import { snapshotOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

import BlobsPage from './RestorePage'

export default async function Backup({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!(await snapshotOwnedByAccount(db, id, account))) {
    return <div>unauthorized</div>
  }
  return <BlobsPage id={id} />
}
