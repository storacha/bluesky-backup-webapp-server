'use client'

import { Did } from '@atproto/api'
import { ArrowsClockwise, Gear } from '@phosphor-icons/react'
import Link from 'next/link'
import { styled } from 'next-yak'
import { toast } from 'sonner'
import useSWR from 'swr'

import { Box, Button, Stack, Text } from '@/components/ui'
import { useProfile } from '@/hooks/use-profile'
import { Backup } from '@/types'

const AccountLogo = styled.div<{
  $imageSrc: string
}>`
  --account-logo-border-color: var(--color-gray-light);
  --account-logo-image: ${({ $imageSrc }) => `url(${$imageSrc})`};
  --account-logo-size: 25px 25px;
  --account-logo-position: center;
  --account-logo-repeat: no-repeat;

  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  height: 42px;
  width: 42px;
  border-radius: 8px;
  border: 1px solid var(--account-logo-border-color);

  display: flex;
  justify-content: stretch;
  align-items: stretch;
  overflow: hidden;

  background-color: var(--color-gray-light);
  background-image: var(--account-logo-image);
  background-size: var(--account-logo-size);
  background-position: var(--account-logo-position);
  background-repeat: var(--account-logo-repeat);
`

const DisconnectedBox = styled(Box)`
  opacity: 0.7;
  border: 1px solid var(--color-red);
  border-radius: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const IdentityLink = styled(Link)`
  display: block;
`

function ATProtoHandle({ did }: { did: Did }) {
  const { data: profile } = useProfile(did)
  return profile?.handle
}

function ATProtoName({ did }: { did: Did }) {
  const { data: profile } = useProfile(did)
  return profile?.displayName
}

type Identity = Backup & {
  isConnected: boolean
}

interface IdentityCardProps {
  identity: Identity
}

export function IdentityCard({ identity }: IdentityCardProps) {
  const { data: identities, mutate } = useSWR(['api', '/api/identities'])
  const { data: profile } = useProfile(identity.atprotoAccount)

  const connectNewAccount = (handle?: string) => {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const url = handle
      ? `/atproto/connect?handle=${encodeURIComponent(handle)}`
      : '/atproto/connect'

    const connectWindow = window.open(
      url,
      'atproto-connect',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    )

    // Poll for window close and refresh identities
    const checkWindow = setInterval(async () => {
      if (connectWindow?.closed) {
        clearInterval(checkWindow)
        try {
          // Force a fresh fetch from the server
          const response = await fetch('/api/identities')
          const newData = await response.json()

          // Update the SWR cache with the new data
          await mutate(newData, { revalidate: true })

          // Wait for the cache to be updated
          const updatedIdentity = newData.find(
            (i: Identity) => i.id === identity.id
          )
          if (updatedIdentity?.isConnected) {
            toast.success('Successfully reconnected account')
          }
        } catch (error) {
          console.error('Failed to refresh identities:', error)
          toast.error('Failed to refresh account status')
        }
      }
    }, 500)
  }

  // Get the current state of this identity from the SWR cache
  const currentIdentity =
    identities?.find((i: Identity) => i.id === identity.id) || identity

  return (
    <DisconnectedBox
      $background={
        currentIdentity.isConnected
          ? 'var(--color-white)'
          : 'var(--color-gray-light)'
      }
    >
      <Stack $gap="1rem" $direction="row" $alignItems="center">
        <AccountLogo $imageSrc="/bluesky.png" />
        <Stack $alignItems="start">
          <Stack $direction="row" $alignItems="baseline" $gap="0.5rem">
            <Text
              $color="var(--color-black)"
              $fontSize="0.9rem"
              $fontWeight="bold"
            >
              <ATProtoName did={currentIdentity.atprotoAccount} /> -{' '}
              <ATProtoHandle did={currentIdentity.atprotoAccount} />
            </Text>
            {!currentIdentity.isConnected && (
              <Text
                $color="var(--color-red)"
                $fontSize="0.8rem"
                $fontWeight="bold"
              >
                (Disconnected)
              </Text>
            )}
          </Stack>
          <Text>{currentIdentity.atprotoAccount}</Text>
        </Stack>
      </Stack>
      <Stack $direction="row" $gap="0.5rem">
        {!currentIdentity.isConnected && (
          <Button
            $variant="outline"
            $color="var(--color-black)"
            onClick={() => profile?.handle && connectNewAccount(profile.handle)}
            title="Reconnect account"
            disabled={!profile?.handle}
          >
            <ArrowsClockwise weight="bold" />
          </Button>
        )}
        <IdentityLink
          href={`/identities/${encodeURIComponent(currentIdentity.atprotoAccount)}`}
        >
          <Button $variant="outline" $color="var(--color-black)">
            <Gear weight="bold" />
          </Button>
        </IdentityLink>
      </Stack>
    </DisconnectedBox>
  )
}
