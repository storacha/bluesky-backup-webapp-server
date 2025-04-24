'use client'

import { use } from 'react'
import { Sidebar } from '@/app/Sidebar'
import { useSWR } from '@/app/swr'
import { BackupScreen } from '@/components/Backup/index'

export default function Backup({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = use(params)
  const id = parseInt(idParam)
  // TODO: Should we fetch individual backups? We already need the list for the
  // sidebar, and they're not heavy so far, but we should check back on this at
  // the end of the first version.
  const { data: backups, error } = useSWR(['api', '/api/backups'])
  if (error) throw error
  if (!backups) return null

  const backup = backups.find((backup) => backup.id === id)
  if (!backup) return null

  return (
    <>
      <Sidebar selectedBackupId={id} />
      <BackupScreen backup={backup} />
    </>
  )
}
