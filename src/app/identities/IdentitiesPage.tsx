'use client'

import { Did } from '@atproto/api'
import { Gear } from '@phosphor-icons/react'
import Link from 'next/link'
import { styled } from 'next-yak'

import { Box, Button, Heading, Stack, Text } from '@/components/ui'
import { useProfile } from '@/hooks/use-profile'

import { Sidebar } from '../Sidebar'

const IdentitiesStack = styled(Stack)`
  padding: 2rem;
  width: 100%;
`

const IdentityLink = styled(Link)`
  display: block;
`

// TODO: Dedupe with `AccountLogo` in `Select`
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

function ATProtoHandle({ did }: { did: Did }) {
  const { data: profile } = useProfile(did)
  return profile?.handle
}

function ATProtoName({ did }: { did: Did }) {
  const { data: profile } = useProfile(did)
  return profile?.displayName
}

export default function IdentitiesPage({ accounts }: { accounts: Did[] }) {
  return (
    <>
      <Sidebar selectedBackupId={null} />
      <IdentitiesStack $gap="1rem">
        <Heading>Bluesky Identities</Heading>
        {accounts.map((account) => (
          <Box
            key={account}
            $gap="1rem"
            $display="flex"
            $justifyContent="space-between"
            $background="var(--color-white)"
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
                    <ATProtoName did={account} /> -{' '}
                    <ATProtoHandle did={account} />
                  </Text>
                </Stack>
                <Text>{account}</Text>
              </Stack>
            </Stack>
            <IdentityLink href={`/identities/${encodeURIComponent(account)}`}>
              <Button $variant="outline" $color="var(--color-black)">
                <Gear />
              </Button>
            </IdentityLink>
          </Box>
        ))}
      </IdentitiesStack>
    </>
  )
}
