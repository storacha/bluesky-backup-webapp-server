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
  min-height: 100vh;
`

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
`

export const AppLayout = ({ children, selectedBackupId }: AppLayoutProps) => {
  return (
    <LayoutContainer>
      <Sidebar selectedBackupId={selectedBackupId} />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  )
}
