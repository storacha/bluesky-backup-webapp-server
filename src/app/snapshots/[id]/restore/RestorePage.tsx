'use client'

import { Sidebar } from '@/app/Sidebar'
import RestoreDialog from '@/components/Restore'

export default function RestorePage({ id }: { id: string }) {
  return (
    <>
      <Sidebar selectedBackupId={null} />
      <RestoreDialog snapshotId={id} />
    </>
  )
}
