'use client'

import { AppLayout } from '@/app/AppLayout'
import { Blobs } from '@/components/Blobs'

export default function BlobsPage({ id }: { id: string }) {
  return (
    <AppLayout selectedBackupId={null}>
      <Blobs id={id} />
    </AppLayout>
  )
}
