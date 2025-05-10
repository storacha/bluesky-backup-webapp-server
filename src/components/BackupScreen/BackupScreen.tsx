'use client'

import { styled } from 'next-yak'
import { ReactNode, Suspense } from 'react'

import { Heading } from '@/components/ui'

import { SharedScreenLayout } from '../SharedScreen'

const RightPanelContainer = styled.div`
  height: 100%;
  padding: 2rem;
  overflow-y: auto;
  border-left: 1px solid var(--color-light-blue);
`

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
            <Heading>Backup & Restore</Heading>
            {rightSidebarContent}
          </RightPanel>
        </Suspense>
      }
    />
  )
}
