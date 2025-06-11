import { styled } from 'next-yak'
import { ReactNode } from 'react'

import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
  selectedBackupId: string | null
}

const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow: auto;
  background-color: var(--color-light-blue-10);
`

export const AppLayout = ({ children, selectedBackupId }: AppLayoutProps) => {
  return (
    <LayoutContainer>
      <Sidebar selectedBackupId={selectedBackupId} />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  )
}
