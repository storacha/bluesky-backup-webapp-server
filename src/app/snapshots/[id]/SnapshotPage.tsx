'use client'

import { Sidebar } from '@/app/Sidebar'
import { SnapshotScreen } from '@/components/SnapshotScreen'
import { useSWR } from '@/lib/swr'

export default function SnapshotPage({ id }: { id: string }) {
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])
  if (error) throw error
  if (!snapshot) return null

  return (
    <>
      <Sidebar selectedBackupId={null} />
      <SnapshotScreen snapshot={snapshot} />
    </>
  )
}
