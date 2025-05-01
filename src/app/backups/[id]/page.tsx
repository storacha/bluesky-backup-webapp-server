'use server'

import { backupOwnedByAccount } from '@/lib/server/auth'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

import BackupPage from './BackupPage'

export default async function Backup({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = parseInt(idParam)
  const { db } = getStorageContext()
  const { did: account } = await getSession()
  if (!(await backupOwnedByAccount(db, id, account))) {
    return <div>unauthorized</div>
  }
  return <BackupPage id={id} />
}
