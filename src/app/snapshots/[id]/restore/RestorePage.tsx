'use client'

import { Sidebar } from '@/app/Sidebar'
import RestoreDialog from '@/components/RestoreUI/dynamic'
import { Box } from '@/components/ui'

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
