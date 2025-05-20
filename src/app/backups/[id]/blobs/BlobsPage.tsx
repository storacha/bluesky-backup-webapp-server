'use client'

import { AppLayout } from '@/app/AppLayout'
import { Blobs } from '@/components/Blobs'
import { useSWR } from '@/lib/swr'

export default function AllBlobs({ backupId }: { backupId: string }) {
  const {
    data: blobs,
    error,
    isLoading,
  } = useSWR(['api', `/api/backups/${backupId}/blobs`])
  if (error) throw error
  return (
    <AppLayout selectedBackupId={backupId}>
      <Blobs
        blobs={blobs || []}
        backPath={`/backups/${backupId}`}
        loading={isLoading}
        location="Backup"
      />
    </AppLayout>
  )
}
