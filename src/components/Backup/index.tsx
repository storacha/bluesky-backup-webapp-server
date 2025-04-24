import { styled } from 'next-yak'
import { BackupDetail } from './Backup'
import { BackupRestore } from './Restore'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useStorachaAccount } from '@/hooks/use-plan'
import { Backup } from '@/app/types'

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

export const BackupScreen = ({ backup }: { backup?: Backup }) => {
  const account = useStorachaAccount()
  return (
    <BackupContainer>
      <PanelGroup autoSaveId="backup-restore-layout" direction="horizontal">
        <Panel defaultSize={60} minSize={45}>
          <BackupDetail account={account} backup={backup} />
        </Panel>
        <PanelResizeHandle>
          <ResizeHandleOuter>
            <ResizeHandleInner />
          </ResizeHandleOuter>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={40}>
          <BackupRestore backup={backup} />
        </Panel>
      </PanelGroup>
    </BackupContainer>
  )
}
