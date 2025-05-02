// 'use client'

import { CredentialSession } from '@atproto/api'
import {
  Popover as HPopover,
  PopoverButton as HPopoverButton,
  PopoverPanel as HPopoverPanel,
} from '@headlessui/react'
import { CircleStackIcon } from '@heroicons/react/20/solid'
import {
  ArrowCircleRight,
  Cloud,
  Database,
  IdentificationBadge,
} from '@phosphor-icons/react'
import { css, styled } from 'next-yak'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ATPROTO_DEFAULT_SINK, ATPROTO_DEFAULT_SOURCE } from '@/lib/constants'
import { PrefsDoc } from '@/lib/db'
import { shortenDID } from '@/lib/ui'

import { Box } from '../BackupScreen/BackupDetail'
import { Button, Heading, InputField, Stack, SubHeading, Text } from '../ui'

export type LoginFn = (
  identifier: string,
  password: string,
  options?: { server?: string }
) => Promise<void>

export interface LoginForm {
  handle: string
  password: string
  server: string
}

interface AtprotoLoginFormProps {
  login: LoginFn
  defaultServer?: string
  className?: string
}

interface PlcTokenFormParams {
  token: string
}

export type CreateAccountFn = (
  handle: string,
  password: string,
  email: string,
  options?: { server?: string; inviteCode?: string }
) => Promise<void>

export type CreateAccountForm = LoginForm & {
  email: string
  inviteCode?: string
}

interface AtprotoCreateAccountFormProps {
  createAccount: CreateAccountFn
  defaultServer?: string
}

export interface Repo {
  cid: string
  encryptedWith?: string
  accountDid: string
  createdAt: Date
}

export interface Blob {
  cid: string
  contentType?: string
  encryptedWith?: string
}

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

const DataSourceIcon = styled.div`
  ${flexCenter}
  width: 32px;
  &:hover {
    background-color: var(--color-white);
  }
`
//  < div className = "rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center" >
//<span className="font-bold text-sm ">

const StorachaElement = styled.div`
  ${flexCenter}
  width: 112px;
`

const AtProtoElement = styled.div`
  ${flexCenter}
  width: 112px;
`

interface RestoreDialogViewProps {
  sourceSession?: CredentialSession
  sinkSession?: CredentialSession
  loginToSource: LoginFn
  loginToSink: LoginFn
  createAccount: CreateAccountFn
  repo?: Repo
  blobs?: Blob[]
  prefsDoc?: PrefsDoc
  isRestoringRepo?: boolean
  isRestoringBlobs?: boolean
  isTransferringIdentity?: boolean
  isRepoRestored?: boolean
  areBlobsRestored?: boolean
  isIdentityTransferred?: boolean
  restoreRepo: () => Promise<void>
  restoreBlobs: () => Promise<void>
  transferIdentity: () => Promise<void>
  sendPlcRestoreAuthorizationEmail: () => Promise<void>
  isPlcRestoreAuthorizationEmailSent?: boolean
  setupPlcRestore: (plcToken: string) => Promise<void>
  isPlcRestoreSetup?: boolean
}

export function RestoreDialogView({
  sourceSession,
  sinkSession,
  loginToSource,
  createAccount,
  restoreRepo,
  restoreBlobs,
  transferIdentity,
  sendPlcRestoreAuthorizationEmail,
  isPlcRestoreAuthorizationEmailSent,
  setupPlcRestore,
  isPlcRestoreSetup,
  repo,
  blobs,
  isRestoringRepo,
  isRestoringBlobs,
  isTransferringIdentity,
  isRepoRestored,
  areBlobsRestored,
  isIdentityTransferred,
}: RestoreDialogViewProps) {
  const [showTransferAuthorization, setShowTransferAuthorization] =
    useState(false)
  return (
    <Box $height="100%">
      {sourceSession ? (
        sinkSession ? (
          <Stack $alignItems="center">
            <Stack $alignItems="center">
              <Stack $alignItems="start">
                <Stack
                  $gap="1rem"
                  $direction="row"
                  $alignItems="center"
                  $width="100%"
                  $bottom="1rem"
                >
                  <DataTypeHeading />
                  <StorachaElement>
                    <Text>Storacha</Text>
                  </StorachaElement>
                  <div style={{ width: '48px' }}></div>
                  <AtProtoElement>
                    <Stack>
                      <Text>{sinkSession?.serviceUrl.hostname}</Text>
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
                  <DataTypeHeading>Repository</DataTypeHeading>
                  <StorachaElement>
                    <DataSourceIcon>
                      <Popover>
                        <PopoverButton>
                          <CircleStackIcon
                            style={{ width: '16px', height: '16px' }}
                          />
                        </PopoverButton>
                        <PopoverPanel anchor="bottom">
                          <div>Account: {repo?.accountDid}</div>
                          <div>
                            Created At: {repo?.createdAt.toDateString()}
                          </div>
                        </PopoverPanel>
                      </Popover>
                    </DataSourceIcon>
                  </StorachaElement>
                  {isRestoringRepo ? (
                    <Button
                      $isLoading
                      $hideLoadingText
                      $variant="outline"
                      aria-label="Restoring repository"
                    />
                  ) : (
                    <Button
                      onClick={restoreRepo}
                      disabled={isRestoringRepo}
                      $variant="outline"
                      $leftIcon={
                        <ArrowCircleRight
                          size="16"
                          color="var(--color-gray-medium)"
                        />
                      }
                    />
                  )}
                  <AtProtoElement>
                    <DataSinkIcon $restored={isRepoRestored}>
                      <Database size="16" />
                    </DataSinkIcon>
                  </AtProtoElement>
                </Stack>

                <Stack
                  $gap="1rem"
                  $direction="row"
                  $alignItems="center"
                  $left="1rem"
                  $right="1rem"
                >
                  <DataTypeHeading>Blobs</DataTypeHeading>
                  <StorachaElement>
                    <DataSourceIcon>{blobs?.length || '0'}</DataSourceIcon>
                  </StorachaElement>
                  {isRestoringBlobs ? (
                    <Button
                      $isLoading
                      $hideLoadingText
                      $variant="outline"
                      className="rounded-full w-8 h-8"
                      aria-label="Restoring blobs"
                    />
                  ) : (
                    <Button
                      onClick={restoreBlobs}
                      disabled={isRestoringBlobs}
                      $variant="outline"
                      className="rounded-full w-8 h-8"
                      $leftIcon={
                        <ArrowCircleRight
                          size="16"
                          color="var(--color-gray-medium)"
                        />
                      }
                    />
                  )}
                  <AtProtoElement>
                    <DataSinkIcon $restored={areBlobsRestored}>
                      <Cloud size="16" color="var(--color-gray-medium)" />
                    </DataSinkIcon>
                  </AtProtoElement>
                </Stack>
                <div style={{ height: '30px' }}></div>
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
                      <Text>{sourceSession.serviceUrl.hostname}</Text>
                      <Text>
                        {sourceSession.did && shortenDID(sourceSession.did)}
                      </Text>
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
                  {isTransferringIdentity ? (
                    <Button
                      $isLoading
                      $hideLoadingText
                      $variant="outline"
                      className="rounded-full w-8 h-8 "
                      aria-label="Transferring identity"
                    />
                  ) : isPlcRestoreAuthorizationEmailSent ? (
                    isPlcRestoreSetup ? (
                      <div className="flex flex-col items-center">
                        <Button
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
                              Identity Transfer is not currently reversible,
                              please use caution!
                            </Text>
                          </PopoverPanel>
                        </Popover>
                      </div>
                    ) : (
                      <PlcTokenForm setPlcToken={setupPlcRestore} />
                    )
                  ) : showTransferAuthorization ? (
                    <Stack>
                      <Button
                        onClick={sendPlcRestoreAuthorizationEmail}
                        disabled={isTransferringIdentity}
                        $variant="primary"
                      >
                        Send Email
                      </Button>
                      <Popover>
                        <PopoverButton></PopoverButton>
                        <PopoverPanel static anchor="bottom">
                          <Text>
                            To transfer your identity you must provide a
                            confirmation code sent to the email registered with
                            your current PDS host.
                          </Text>
                        </PopoverPanel>
                      </Popover>
                    </Stack>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowTransferAuthorization(true)
                      }}
                      disabled={isTransferringIdentity}
                      $variant="outline"
                      $leftIcon={
                        <ArrowCircleRight
                          size="16"
                          color="var(--color-gray-medium)"
                        />
                      }
                    />
                  )}

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
              <Heading>Data Restore and Identity Transfer</Heading>
              <SubHeading>Please create a new ATProto account.</SubHeading>
            </Stack>
            <AtprotoCreateAccountForm
              createAccount={createAccount}
              defaultServer={ATPROTO_DEFAULT_SINK}
            />
          </Stack>
        )
      ) : (
        <Stack $gap="1rem">
          <Stack $gap="0.25rem">
            <Heading>Data Restore and Identity Transfer</Heading>
            <SubHeading>
              Please log in to your existing Bluesky account.
            </SubHeading>
          </Stack>
          <AtprotoLoginForm
            login={loginToSource}
            defaultServer={ATPROTO_DEFAULT_SOURCE}
          />
        </Stack>
      )}
    </Box>
  )
}

const LoginFormElement = styled.form`
  width: 384px;
`

function AtprotoLoginForm({ login, defaultServer }: AtprotoLoginFormProps) {
  const { register, handleSubmit, reset } = useForm<LoginForm>()
  const onSubmit = handleSubmit(async (data) => {
    await login(data.handle, data.password, {
      server: data.server || `https://${defaultServer}`,
    })
    reset()
  })
  return (
    <LoginFormElement onSubmit={onSubmit}>
      <Stack $gap="1rem">
        <InputField
          label="Server"
          placeholder={`https://${defaultServer}`}
          {...register('server')}
        />
        <InputField
          label="Handle"
          placeholder={`racha.${defaultServer}`}
          autoComplete="off"
          {...register('handle')}
        />
        <InputField
          label="Password"
          type="password"
          autoComplete="off"
          {...register('password')}
        />
        <Button type="submit">Log In</Button>
      </Stack>
    </LoginFormElement>
  )
}

function PlcTokenForm({
  setPlcToken,
}: {
  setPlcToken: (token: string) => void
}) {
  const { register, handleSubmit } = useForm<PlcTokenFormParams>()

  return (
    <form onSubmit={handleSubmit((data) => setPlcToken(data.token))}>
      <Stack $gap="1rem">
        <InputField placeholder="Confirmation Code" {...register('token')} />
        <Button type="submit" $variant="primary">
          Confirm
        </Button>
      </Stack>
    </form>
  )
}

function AtprotoCreateAccountForm({
  createAccount,
  defaultServer,
}: AtprotoCreateAccountFormProps) {
  const { register, handleSubmit } = useForm<CreateAccountForm>()

  return (
    <LoginFormElement
      onSubmit={handleSubmit((data) =>
        createAccount(data.handle, data.password, data.email, {
          server: data.server || `https://${defaultServer}`,
          inviteCode: data.inviteCode,
        })
      )}
    >
      <Stack $gap="1rem">
        <InputField
          label="Server"
          placeholder={`https://${defaultServer}`}
          {...register('server')}
        />
        <InputField
          label="Handle"
          placeholder={`racha.${defaultServer}`}
          {...register('handle')}
        />
        <InputField
          label="Email"
          placeholder="racha@storacha.network"
          {...register('email')}
        />
        <InputField
          label="Password"
          type="password"
          {...register('password')}
        />
        <InputField label="Invite Code" {...register('inviteCode')} />
        <Button type="submit" $variant="primary">
          Create Account
        </Button>
      </Stack>
    </LoginFormElement>
  )
}
