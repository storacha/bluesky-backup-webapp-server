import { ReactNode } from 'react'

import { Sidebar } from '@/app/Sidebar'

interface AppLayoutProps {
  children: ReactNode
  selectedBackupId: string | null
}

export const AppLayout = ({ children, selectedBackupId }: AppLayoutProps) => {
  return (
    <>
      <Sidebar selectedBackupId={selectedBackupId} />
      {children}
    </>
  )
}
