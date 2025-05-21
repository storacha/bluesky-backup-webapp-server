'use client'
import Form from 'next/form'
import { styled } from 'next-yak'
import React from 'react'
import { useFormStatus } from 'react-dom'

import {
  Center,
  Heading,
  InputField,
  Stack,
  StatefulButton,
  SubHeading,
} from '@/components/ui'
import { useStorachaAccount } from '@/hooks/use-plan'

import connectHandle from './connectHandle'

export const ConnectStack = styled(Stack)`
  padding: 0 2rem;
`

const ConnectButton = () => {
  const { pending } = useFormStatus()
  return (
    <StatefulButton
      isLoading={pending}
      disabled={pending}
      $background="var(--color-dark-blue)"
      $height="fit-content"
      $fontSize="0.75rem"
      type="submit"
    >
      Connect
    </StatefulButton>
  )
}

const ConnectPage: React.FC = () => {
  const account = useStorachaAccount()
  if (!account) return null

  return (
    <Center $height="100vh">
      <ConnectStack $gap="1.2rem" $width="100%">
        <Stack>
          <Heading>Connect your Bluesky Account</Heading>
          <SubHeading>
            To get started, please log in to your Bluesky account.
          </SubHeading>
        </Stack>
        <Form action={connectHandle}>
          <input type="hidden" name="account" value={account.did()} />
          <Stack $gap="1rem">
            <InputField
              name="handle"
              required
              label="Bluesky Handle"
              placeholder="Enter your handle"
            />
            <ConnectButton />
          </Stack>
        </Form>
      </ConnectStack>
    </Center>
  )
}

export default ConnectPage
