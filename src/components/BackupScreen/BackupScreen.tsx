'use client'

import { ReactNode, Suspense } from 'react'

import { Heading } from '@/components/ui'

import { SharedScreenLayout } from '../SharedScreen'

import RightSidebar from './RightSidebar'

const RightPanelContainer = RightSidebar

interface RightSidebarProps {
  children: ReactNode
}

const RightPanel = ({ children }: RightSidebarProps) => {
  return <RightPanelContainer>{children}</RightPanelContainer>
}

interface BackupScreenProps {
  children: ReactNode
  rightPanelContent: ReactNode
  selectedBackupId: string | null
}

export const BackupScreen = ({
  children,
  selectedBackupId,
  rightPanelContent: rightSidebarContent,
}: BackupScreenProps) => {
  return (
    <SharedScreenLayout
      screenName="backups"
      selectedBackupId={selectedBackupId}
      mainContent={<Suspense>{children}</Suspense>}
      rightPanelContent={
        <Suspense>
          <RightPanel>
            <Heading>Details</Heading>
            {rightSidebarContent}
          </RightPanel>
        </Suspense>
      }
    />
  )
}
