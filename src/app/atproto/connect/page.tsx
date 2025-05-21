'use client'
import { styled } from 'next-yak'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const handleParam = searchParams.get('handle')

  if (!account) return null

  const handleAppend = (e: React.FormEvent<HTMLFormElement>) => {
    const handleInput = e.currentTarget.elements.namedItem(
      'handle'
    ) as HTMLInputElement
    const handle = handleInput.value.trim()

    if (!handle.includes('.')) {
      handleInput.value = `${handle}.bsky.social`
    }
  }

  return (
    <Center $height="100vh">
      <ConnectStack $gap="1.2rem" $width="100%">
        <Stack>
          <Heading>Connect your Bluesky Account</Heading>
          <SubHeading>
            {' '}
            To get started, please log in to your Bluesky account.{' '}
          </SubHeading>
        </Stack>
        <form action="/atproto/oauth" method="POST" onSubmit={handleAppend}>
          <input type="hidden" name="account" value={account.did()} />
          <Stack $gap="1rem">
            <InputField
              name="handle"
              required
              label="Bluesky Handle"
              placeholder="Enter your handle"
              defaultValue={handleParam || ''}
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
