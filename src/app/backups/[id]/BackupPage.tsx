'use client'

import { AppLayout } from '@/app/AppLayout'
import { BackupScreen } from '@/components/BackupScreen'
import { BackupDetail } from '@/components/BackupScreen/BackupDetail'
import { useSWR } from '@/lib/swr'

import { RightSidebarContent } from './RightSidebarContent'

export default function BackupPage({ id }: { id: string }) {
  const { data: backup, error } = useSWR(['api', `/api/backups/${id}`])
  if (error) throw error
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
