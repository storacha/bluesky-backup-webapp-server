'use client'

import { AppLayout } from '@/app/AppLayout'
import { Blobs } from '@/components/Blobs'
import { useSWR } from '@/lib/swr'
import { ATBlob } from '@/types'

export default function BlobsPage({ id }: { id: string }) {
  const {
    data: blobs,
    error,
    isLoading,
  } = useSWR(['api', `/api/snapshots/${id}/blobs`])
  if (error) throw error
  return (
    <AppLayout selectedBackupId={null}>
      <Blobs
        // TS can't different the keys in the Fetchable tuple since
        // /api/snapshots/${id} and /api/snapshots/${id}/blobs share a snimilar shape
        // hence my tpe assertin here
        blobs={blobs as ATBlob[]}
        backPath={`/backups/${id}`}
        loading={isLoading}
        location="Snapshot"
      />
    </AppLayout>
  )
}
