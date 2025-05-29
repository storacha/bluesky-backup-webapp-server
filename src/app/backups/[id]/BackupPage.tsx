'use client'

import { AppLayout } from '@/app/AppLayout'
import { BackupScreen } from '@/components/BackupScreen'
import { BackupDetail } from '@/components/BackupScreen/BackupDetail'
import { useSWR } from '@/lib/swr'

import { RightSidebarContent } from './RightSidebarContent'

export default function BackupPage({ id }: { id: string }) {
  // TODO: Should we fetch individual backups? We already need the list for the
  // sidebar, and they're not heavy so far, but we should check back on this at
  // the end of the first version.
  const { data: backups, error } = useSWR(['api', '/api/backups'])
  if (error) throw error
  const backup = backups?.find((backup) => backup.id === id)

  if (!backup) return null

  return (
    <AppLayout selectedBackupId={id}>
      <BackupScreen
        selectedBackupId={id}
        rightPanelContent={<RightSidebarContent backup={backup} />}
      >
        <BackupDetail backup={backup} />
      </BackupScreen>
    </AppLayout>
  )
}
