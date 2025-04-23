'use client'

import { Sidebar } from '@/app/Sidebar'
import { BackupScreen } from '@/components/Backup/index'

export default function NewConfig() {
  return (
    <>
      <Sidebar selectedConfigId={null} />
      <BackupScreen />
    </>
  )
}
