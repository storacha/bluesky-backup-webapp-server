'use client'

import { Did } from '@atproto/api'
import { Gear } from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { styled } from 'next-yak'

import { AccountLogo } from '@/components/BackupScreen/BackupDetail'
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
              <AccountLogo $type="original" $hasAccount={true}>
                <Image
                  src="/bluesky.png"
                  alt="Bluesky Logo"
                  width={25}
                  height={25}
                />
              </AccountLogo>
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
