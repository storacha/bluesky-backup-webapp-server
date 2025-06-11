'use client'

import { styled } from 'next-yak'
import { ReactNode, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

/* eslint-disable import/no-restricted-paths */
import { Sidebar } from '@/app/Sidebar'
import { Container, StyleProps } from '@/components/ui'
import { useMobileScreens } from '@/hooks/use-mobile-screens'

const ScreenContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
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

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const MobileLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
`

const MobileTopSection = styled.div`
  position: relative;
`

const MobileBottomSection = styled.div`
  flex: 1;
  height: 100%;
`

const HamburgerButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  background: var(--color-white);
  border: 1px solid var(--color-gray-medium-light);
  border-radius: 4px;
  padding: 0.25rem;
  z-index: 10;

  @media only screen and (min-width: 0px) and (max-width: 992px) {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-gray-light);
  }
`

const HamburgerLine = styled.span`
  width: 100%;
  height: 2px;
  background-color: var(--color-gray-medium);
  transition: all 0.3s ease;
`

const MobileSidebar = styled.div<Partial<StyleProps> & { $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: ${({ $width = '70%' }) => $width};
  height: 100vh;
  background-color: var(--color-gray-extra-light);
  z-index: 100;
  transform: translateX(${(props) => (props.$isOpen ? '0' : '-100%')});
  transition: transform 0.3s ease;
  box-shadow: ${(props) =>
    props.$isOpen ? '0 0 10px rgba(0, 0, 0, 0.1)' : 'none'};
  overflow-y: auto;

  @media only screen and (min-width: 0px) and (max-width: 992px) {
    display: block;
  }

  @media only screen and (min-width: 576px) and (max-width: 992px) {
    width: 30%;
  }
`

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 99;
  opacity: ${(props) => (props.$isOpen ? '1' : '0')};
  pointer-events: ${(props) => (props.$isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease;

  @media only screen and (min-width: 0px) and (max-width: 992px) {
    display: block;
  }
`

interface SharedScreenLayoutProps {
  mainContent: ReactNode
  rightPanelContent: ReactNode
  selectedBackupId: string | null
  screenName: 'backups' | 'snapshots'
}

export const SharedScreenLayout = ({
  mainContent,
  screenName,
  selectedBackupId,
  rightPanelContent,
}: SharedScreenLayoutProps) => {
  const { isSmallViewPort } = useMobileScreens()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (isSmallViewPort) {
    return (
      <ScreenContainer>
        <MobileSidebar $isOpen={isSidebarOpen}>
          <Sidebar selectedBackupId={selectedBackupId} variant="mobile" />
        </MobileSidebar>
        <Overlay
          $isOpen={isSidebarOpen}
          onClick={() => setIsSidebarOpen(false)}
        />
        <MobileLayout>
          <MobileTopSection>
            <HamburgerButton
              onClick={toggleMobileSidebar}
              aria-label="Toggle sidebar"
            >
              {Array.from({ length: 3 }, (_, index) => {
                return <HamburgerLine key={index} />
              })}
            </HamburgerButton>
            <Container>{mainContent}</Container>
          </MobileTopSection>
          <MobileBottomSection>{rightPanelContent}</MobileBottomSection>
        </MobileLayout>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <PanelGroup
        autoSaveId={`${screenName}-screen-layout`}
        direction="horizontal"
      >
        <Panel defaultSize={60} minSize={45}>
          <ContentWrapper>
            <Container>{mainContent}</Container>
          </ContentWrapper>
        </Panel>
        <PanelResizeHandle>
          <ResizeHandleOuter>
            <ResizeHandleInner />
          </ResizeHandleOuter>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={40}>
          {rightPanelContent}
        </Panel>
      </PanelGroup>
    </ScreenContainer>
  )
}
