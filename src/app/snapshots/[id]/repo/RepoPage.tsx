'use client'

import { Sidebar } from '@/app/Sidebar'
import { useSWR } from '@/app/swr'

export default function SnapshotPage({ id }: { id: string }) {
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])
  if (error) throw error
  if (!snapshot) return null

  return (
    <>
      <Sidebar selectedBackupId={null} />
      TODO: Visualize repo {snapshot.repositoryCid}
    </>
  )
}
