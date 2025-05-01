'use client'

import { styled } from 'next-yak'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { Snapshot } from '@/app/types'

import { Button, Container } from '../ui'

import SnapshotDetail from './SnapshotDetail'

const SnapshotContainer = styled.div`
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

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
`

export const SnapshotScreen = ({ snapshot }: { snapshot: Snapshot }) => {
  return (
    <SnapshotContainer>
      <PanelGroup autoSaveId="backup-restore-layout" direction="horizontal">
        <Panel defaultSize={60} minSize={45}>
          <SnapshotDetail snapshot={snapshot} />
        </Panel>
        <PanelResizeHandle>
          <ResizeHandleOuter>
            <ResizeHandleInner />
          </ResizeHandleOuter>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={40}>
          <RestoreContainer>
            <Button>Restore</Button>
          </RestoreContainer>
        </Panel>
      </PanelGroup>
    </SnapshotContainer>
  )
}
