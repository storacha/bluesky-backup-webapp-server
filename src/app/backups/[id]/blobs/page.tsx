import { backupOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

import AllBlobs from './BlobsPage'

export default async function AllBlobsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!(await backupOwnedByAccount(db, id, account))) {
    return <div>unauthorized!</div>
  }
  return <AllBlobs backupId={id} />
}
