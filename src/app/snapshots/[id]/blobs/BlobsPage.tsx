'use client'

import { Sidebar } from '@/app/Sidebar'
import { useSWR } from '@/lib/swr'
import { ATBlob } from '@/types'

export default function BlobsPage({ id }: { id: string }) {
  const { data: blobsData, error: error } = useSWR([
    'api',
    `/api/snapshots/${id}/blobs`,
  ])
  if (error) throw error
  if (!blobsData) return null

  // there's a bug with the fetcher that makes typescript think this could be a Snapshot, but it can't
  // TOOD fix the fetcher
  const blobs = blobsData as ATBlob[]

  return (
    <>
      <Sidebar selectedBackupId={null} />
      TODO: Visualize {blobs?.length} blobs
    </>
  )
}
