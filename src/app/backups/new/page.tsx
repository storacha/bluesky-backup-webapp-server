'use client'

import { Sidebar } from '@/app/Sidebar'
import { BackupScreen } from '@/components/BackupScreen/index'

export default function NewBackup() {
  return (
    <>
      <Sidebar selectedBackupId={null} />
      <BackupScreen />
    </>
  )
}
