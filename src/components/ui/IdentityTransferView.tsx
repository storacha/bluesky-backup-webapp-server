import { CredentialSession } from '@atproto/api'
import { styled } from 'next-yak'
import { useState } from 'react'

import { ATPROTO_DEFAULT_SINK } from '@/lib/constants'
import { ProfileData } from '@/types'

import { Box, Button, Heading, Stack, SubHeading, Text } from '.'

import {
  AtprotoCreateAccountForm,
  AtprotoLoginForm,
  CreateAccountFn,
  LoginFn,
} from './atproto'

interface IdentityTransferViewProps {
  profile: ProfileData
  sinkSession?: CredentialSession
  createAccount: CreateAccountFn
  loginToSink: LoginFn
  transferIdentity: () => Promise<void>
  isTransferringIdentity?: boolean
  isIdentityTransferred?: boolean
}

export default function IdentityTransferView({
  profile,
  sinkSession,
  createAccount,
  loginToSink,
  transferIdentity,
  isTransferringIdentity,
  isIdentityTransferred,
}: IdentityTransferViewProps) {
  return (
    <Box $height="100%">
      {sinkSession ? (
        <Stack $gap="1rem">
          <Heading>Identity</Heading>
          <Text>
            You are going to transfer control over {profile.handle} to{' '}
            {sinkSession.serviceUrl.hostname}.
          </Text>
          <Text>Are you sure you want to do this?</Text>
          {isIdentityTransferred ? (
            <Text $color="var(--color-black)" $fontSize="1rem">
              Success! <b>{profile.handle}</b> has been transferred to{' '}
              <b>{sinkSession.serviceUrl.hostname}</b>
            </Text>
          ) : (
            <Button
              $isLoading={isTransferringIdentity}
              onClick={transferIdentity}
              disabled={isTransferringIdentity}
            >
              Yes, make it happen!
            </Button>
          )}
        </Stack>
      ) : (
        <Stack $gap="1rem">
          <Stack $gap="0.25rem">
            <Heading>Data Restore</Heading>
            <SubHeading>
              Please login to your new account or create a new ATProto account.
            </SubHeading>
          </Stack>
          <LoginOrCreate login={loginToSink} createAccount={createAccount} />
        </Stack>
      )}
    </Box>
  )
}

const Tab = styled.div<{ $active: boolean }>`
  padding: 0.1em 1em;
  border-top-right-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
  border: 1px black solid;
  border-bottom: ${({ $active }) =>
    $active ? '1px white solid' : '1px black solid'};
  position: relative;
  top: 1px;
`

const AuthFormContainer = styled.div`
  border: 1px black solid;
  padding: 1rem;
  border-bottom-right-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
`

function LoginOrCreate({
  createAccount,
  login,
}: {
  createAccount: CreateAccountFn
  login: LoginFn
}) {
  const [isCreate, setIsCreate] = useState<boolean>(false)
  return (
    <Stack>
      <Stack $direction="row" $gap="0.1em">
        <Tab
          onClick={() => {
            setIsCreate(false)
          }}
          $active={!isCreate}
        >
          Login
        </Tab>
        <Tab
          onClick={() => {
            setIsCreate(true)
          }}
          $active={isCreate}
        >
          Create
        </Tab>
      </Stack>
      <AuthFormContainer>
        {isCreate ? (
          <AtprotoCreateAccountForm
            createAccount={createAccount}
            defaultServer={ATPROTO_DEFAULT_SINK}
          />
        ) : (
          <AtprotoLoginForm
            login={login}
            defaultServer={ATPROTO_DEFAULT_SINK}
          />
        )}
      </AuthFormContainer>
    </Stack>
  )
}
