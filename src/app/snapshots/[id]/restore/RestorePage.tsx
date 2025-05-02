'use client'

import { Sidebar } from '@/app/Sidebar'
import { Box } from '@/components/BackupScreen/BackupDetail'
import RestoreDialog from '@/components/Restore'

export default function RestorePage({ id }: { id: string }) {
  return (
    <>
      <Sidebar selectedBackupId={null} />
      <Box $padding="16px">
        <RestoreDialog snapshotId={id} />
      </Box>
    </>
  )
}
