'use client'

import { styled } from 'next-yak'
import { useState } from 'react'
import useSWR, { SWRResponse } from 'swr'

import { Sidebar } from '@/app/Sidebar'
import { Heading, Stack } from '@/components/ui'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { Identity } from '@/types'

import { IdentityCard } from './components/IdentityCard'

const IdentitiesStack = styled(Stack)`
  padding: 2rem;
  width: 100%;
`

const IdentitiesLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-4 p-4">{children}</div>
)

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

const MobileSidebar = styled.div<{
  $isOpen: boolean
  $width?: string
}>`
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

const Overlay = styled.div<{
  $isOpen: boolean
}>`
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

export default function IdentitiesPage({
  identities: initialIdentities,
}: {
  identities: Identity[]
}) {
  const { data: identities, error }: SWRResponse<Identity[] | undefined> =
    useSWR(['api', '/api/identities'], {
      fallbackData: initialIdentities,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 0,
    })

  const { isSmallViewPort } = useMobileScreens()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (error) {
    return (
      <IdentitiesLayout>
        <div className="text-red-500">
          Error loading identities: {error.message}
        </div>
      </IdentitiesLayout>
    )
  }

  if (isSmallViewPort) {
    return (
      <div>
        <MobileSidebar $isOpen={isSidebarOpen} $width="70%">
          <Sidebar selectedBackupId={null} variant="mobile" />
        </MobileSidebar>
        <Overlay
          $isOpen={isSidebarOpen}
          onClick={() => setIsSidebarOpen(false)}
        />
        <HamburgerButton
          onClick={toggleMobileSidebar}
          aria-label="Toggle sidebar"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <HamburgerLine key={index} />
          ))}
        </HamburgerButton>
        <IdentitiesLayout>
          <IdentitiesStack $gap="1rem">
            <Heading>Bluesky Identities</Heading>
            {identities?.map((identity) => (
              <IdentityCard key={identity.id} identity={identity as Identity} />
            ))}
          </IdentitiesStack>
        </IdentitiesLayout>
      </div>
    )
  }

  return (
    <IdentitiesLayout>
      <IdentitiesStack $gap="1rem">
        <Heading>Bluesky Identities</Heading>
        {identities?.map((identity) => (
          <IdentityCard key={identity.id} identity={identity as Identity} />
        ))}
      </IdentitiesStack>
    </IdentitiesLayout>
  )
}
