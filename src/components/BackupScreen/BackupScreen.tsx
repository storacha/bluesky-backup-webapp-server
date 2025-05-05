'use client'

import { styled } from 'next-yak'
import { ReactNode, Suspense } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { useStorachaAccount } from '@/hooks/use-plan'
import { Backup } from '@/types'

import { Heading } from '../ui'

import { BackupDetail } from './BackupDetail'
import RightSidebar from './RightSidebar'

const BackupContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: var(--color-light-blue-10);
  height: 100vh;
`

const ResizeHandleOuter = styled.div`
  display: flex;
  align-items: stretch;
  width: 10px;
  cursor: col-resize;
  justify-content: center;
`

const ResizeHandleInner = styled.div`
  width: 1px;
  background-color: var(--color-gray-light);
  &:hover {
    width: 2px;
    background-color: var(--color-gray);
  }
`

export const BackupScreen = ({
  backup,
  sidebarContent: sidebar,
}: {
  backup?: Backup
  sidebarContent: ReactNode
}) => {
  const account = useStorachaAccount()

  return (
    <BackupContainer>
      <PanelGroup autoSaveId="backup-restore-layout" direction="horizontal">
        <Panel defaultSize={60} minSize={45}>
          <Suspense>
            <BackupDetail account={account} backup={backup} />
          </Suspense>
        </Panel>
        <PanelResizeHandle>
          <ResizeHandleOuter>
            <ResizeHandleInner />
          </ResizeHandleOuter>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={40}>
          <Suspense>
            <RightSidebar>
              <Heading>Backup & Restore</Heading>
              {sidebar}
            </RightSidebar>
          </Suspense>
        </Panel>
      </PanelGroup>
    </BackupContainer>
  )
}
