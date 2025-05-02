'use client'

import { useAuthenticator } from '@storacha/ui-react'
import { styled } from 'next-yak'
import React from 'react'

import { Button, Heading, InputField, Stack, SubHeading } from '@/components/ui'

const ConnectStack = styled(Stack)`
  padding: 10rem 10rem;
`

const ConnectPage: React.FC = () => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  if (!account) return null

  return (
    <ConnectStack $gap="1.2rem" $width="100%">
      <Stack>
        <Heading>Connect your Bluesky Account</Heading>
        <SubHeading>
          To get started, please log in to your Bluesky account.
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
  )
}

export default ConnectPage
