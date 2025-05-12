'use client'

import { AppLayout } from '@/app/AppLayout'
import { SnapshotScreen } from '@/components/SnapshotScreen'
import { useSWR } from '@/lib/swr'

export default function SnapshotPage({ id }: { id: string }) {
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])
  if (error) throw error
  if (!snapshot) return null

  return (
    <AppLayout selectedBackupId={snapshot.backupId}>
      <SnapshotScreen snapshot={snapshot} />
    </AppLayout>
  )
}
