'use client'

import { Account } from '@storacha/ui-react'
import Form from 'next/form'
import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
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
import { ConnectStack } from './ui'

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

const Loading = () => {
  return <div>Loading...</div>
}

const ConnectContent = ({ account }: { account: Account | undefined }) => {
  const searchParams = useSearchParams()
  const handleParam = searchParams.get('handle')

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
              defaultValue={handleParam || ''}
            />
            <ConnectButton />
          </Stack>
        </Form>
      </ConnectStack>
    </Center>
  )
}

const ConnectPage: React.FC = () => {
  const account = useStorachaAccount()

  return (
    <Suspense fallback={<Loading />}>
      <ConnectContent account={account} />
    </Suspense>
  )
}

export default ConnectPage
