import { CredentialSession } from '@atproto/api'
import {
  Popover as HPopover,
  PopoverButton as HPopoverButton,
  PopoverPanel as HPopoverPanel,
} from '@headlessui/react'
import { ArrowCircleRight, IdentificationBadge } from '@phosphor-icons/react'
import { css, styled } from 'next-yak'

import { ATPROTO_DEFAULT_SINK } from '@/lib/constants'
import { shortenDID } from '@/lib/ui'
import { ProfileData } from '@/types'

import { Box, Button, Heading, Stack, SubHeading, Text } from '.'

import {
  AtprotoCreateAccountForm,
  AtprotoLoginForm,
  CreateAccountFn,
  LoginFn,
} from './atproto'

const Popover = styled(HPopover)`
  display: relative;
`

const PopoverButton = styled(HPopoverButton)`
  outline: none;
`

const PopoverPanel = styled(HPopoverPanel)`
  display: flex;
  background: white;
  border: 1px solid black;
  border-radius: 0.75rem;
  padding: 0.75rem;
`

const DataTypeHeading = styled(Heading)`
  width: 112px;
`

interface DataSinkIconOptions {
  $restored?: boolean
}

const flexCenter = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const DataSinkIcon = styled.div<DataSinkIconOptions>`
  background-color: var(--color-white);
  color: ${({ $restored }) =>
    $restored ? 'var(--color-green)' : '--color-gray-medium'};
  border-color: ${({ $restored }) =>
    $restored ? 'var(--color-green)' : '--color-gray-medium'};
  width: 32px;
  height: 32px;
  ${flexCenter}
`

const StorachaElement = styled.div`
  ${flexCenter}
  width: 112px;
`

const AtProtoElement = styled.div`
  ${flexCenter}
  width: 112px;
`

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
        <Stack $alignItems="center">
          <Stack $alignItems="center">
            <Stack $alignItems="start">
              <Stack
                $gap="1rem"
                $direction="row"
                $alignItems="center"
                $left="1rem"
                $right="1rem"
              >
                <DataTypeHeading></DataTypeHeading>
                <StorachaElement>
                  <Stack>
                    <Text>{profile.handle}</Text>
                    <Text>{shortenDID(profile.did)}</Text>
                  </Stack>
                </StorachaElement>
                <div style={{ width: '48px' }}></div>
                <AtProtoElement>
                  <Stack>
                    <Text>{sinkSession.serviceUrl.hostname}</Text>
                    <Text>
                      {sinkSession.did && shortenDID(sinkSession.did)}
                    </Text>
                  </Stack>
                </AtProtoElement>
              </Stack>
              <Stack
                $gap="1rem"
                $direction="row"
                $alignItems="center"
                $left="1rem"
                $right="1rem"
              >
                <DataTypeHeading>Identity</DataTypeHeading>
                <StorachaElement>
                  <IdentificationBadge
                    size="16"
                    color="var(--color-gray-medium)"
                  />
                </StorachaElement>
                <Stack>
                  <Button
                    $isLoading={isTransferringIdentity}
                    onClick={transferIdentity}
                    disabled={isTransferringIdentity}
                    $variant="outline"
                    $leftIcon={
                      <ArrowCircleRight
                        size="16"
                        color="var(--color-gray-medium)"
                      />
                    }
                  />
                  <Popover>
                    <PopoverButton></PopoverButton>
                    <PopoverPanel static anchor="bottom">
                      <Text>
                        Identity Transfer is not currently reversible, please
                        use caution!
                      </Text>
                    </PopoverPanel>
                  </Popover>
                </Stack>

                <AtProtoElement>
                  <DataSinkIcon $restored={isIdentityTransferred}>
                    <IdentificationBadge
                      size="16"
                      color="var(--color-gray-medium)"
                    />
                  </DataSinkIcon>
                </AtProtoElement>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Stack $gap="1rem">
          <Stack $gap="0.25rem">
            <Heading>Data Restore</Heading>
            <SubHeading>Please create a new ATProto account.</SubHeading>
          </Stack>
          <AtprotoCreateAccountForm
            createAccount={createAccount}
            defaultServer={ATPROTO_DEFAULT_SINK}
          />
          OR
          <AtprotoLoginForm
            login={loginToSink}
            defaultServer={ATPROTO_DEFAULT_SINK}
          />
        </Stack>
      )}
    </Box>
  )
}
