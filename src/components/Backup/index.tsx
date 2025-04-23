import { styled } from "next-yak"
import { Backup } from "./Backup"
import { BackupRestore } from "./Restore"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useStorachaAccount } from "@/app/hooks"
import { BackupConfig } from "@/app/types"

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

export const BackupScreen = ({ config }: { config?: BackupConfig }) => {

  const account = useStorachaAccount()
  return (
    <BackupContainer>
      <PanelGroup autoSaveId="backup-restore-layout" direction="horizontal">
        <Panel defaultSize={60} minSize={45}>
          <Backup account={account} config={config}/>
        </Panel>
        <PanelResizeHandle>
          <ResizeHandleOuter>
            <ResizeHandleInner />
          </ResizeHandleOuter>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={40}>
          <BackupRestore config={config} />
        </Panel>
      </PanelGroup>
    </BackupContainer>
  )
}
