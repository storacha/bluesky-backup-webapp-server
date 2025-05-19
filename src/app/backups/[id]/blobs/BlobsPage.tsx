'use client'

import { AppLayout } from '@/app/AppLayout'
import { Blobs } from '@/components/Blobs'

export default function AllBlobs({ backupId }: { backupId: string }) {
  return (
    <AppLayout selectedBackupId={backupId}>
      <Blobs id={backupId} type="backup" />
    </AppLayout>
  )
}
