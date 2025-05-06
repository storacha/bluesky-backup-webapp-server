'use client'
import { styled } from 'next-yak'
import React from 'react'

import {
  Button,
  Center,
  Heading,
  InputField,
  Stack,
  SubHeading,
} from '@/components/ui'
import { useStorachaAccount } from '@/hooks/use-plan'

const ConnectStack = styled(Stack)`
  padding: 0 2rem;
`
const ConnectPage: React.FC = () => {
  const account = useStorachaAccount()
  if (!account) return null

  return (
    <Center $height="100vh" $width="100%">
      <ConnectStack $gap="1.2rem" $width="100%">
        <Stack>
          <Heading>Connect your Bluesky Account</Heading>
          <SubHeading>
            {' '}
            To get started, please log in to your Bluesky account.{' '}
          </SubHeading>
        </Stack>
        <form action="/atproto/oauth" method="POST">
          <input type="hidden" name="account" value={account.did()} />
          <Stack $gap="1rem">
            <InputField
              name="handle"
              required
              label="Bluesky Handle"
              placeholder="Enter your handle"
            />
            <Button
              $background="var(--color-dark-blue)"
              $height="fit-content"
              $fontSize="0.75rem"
              type="submit"
            >
              Connect
            </Button>
          </Stack>
        </form>
      </ConnectStack>
    </Center>
  )
}

export default ConnectPage
