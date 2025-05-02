// 'use client'

import { Agent, CredentialSession } from '@atproto/api'
import { Secp256k1Keypair } from '@atproto/crypto'
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
import { useLiveQuery } from 'dexie-react-hooks'
import { css, styled } from 'next-yak'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'

import { ATBlob, Snapshot } from '@/app/types'
import { Key, useKeychainContext } from '@/contexts/keychain'
import { decrypt } from '@/lib/bluesky'
import { ATPROTO_DEFAULT_SINK, ATPROTO_DEFAULT_SOURCE } from '@/lib/constants'
import db, { PrefsDoc } from '@/lib/db'
import { cidUrl } from '@/lib/storacha'
import { shortenDID } from '@/lib/ui'

import { Box, Button, Heading, InputField, Stack, SubHeading, Text } from './ui'

type LoginFn = (
  identifier: string,
  password: string,
  options?: { server?: string }
) => Promise<void>

interface LoginForm {
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

type CreateAccountFn = (
  handle: string,
  password: string,
  email: string,
  options?: { server?: string; inviteCode?: string }
) => Promise<void>

type CreateAccountForm = LoginForm & {
  email: string
  inviteCode?: string
}

interface AtprotoCreateAccountFormProps {
  createAccount: CreateAccountFn
  defaultServer?: string
}

interface Repo {
  cid: string
  encryptedWith?: string
  accountDid: string
  createdAt: Date
}

interface Blob {
  cid: string
  contentType?: string
  encryptedWith?: string
}

interface RestoreDialogViewProps {
  keys: Key[]
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
  isRestoringPrefsDoc?: boolean
  isTransferringIdentity?: boolean
  isRepoRestored?: boolean
  areBlobsRestored?: boolean
  isPrefsDocRestored?: boolean
  isIdentityTransferred?: boolean
  restoreRepo: () => Promise<void>
  restoreBlobs: () => Promise<void>
  restorePrefsDoc: () => Promise<void>
  transferIdentity: () => Promise<void>
  sendPlcRestoreAuthorizationEmail: () => Promise<void>
  isPlcRestoreAuthorizationEmailSent?: boolean
  setupPlcRestore: (plcToken: string) => Promise<void>
  isPlcRestoreSetup?: boolean
}

export default function RestoreDialog({ snapshotId }: { snapshotId: string }) {
  const { keys } = useKeychainContext()
  const { data: snapshot } = useSWR<Snapshot>([
    'api',
    `/api/snapshots/${snapshotId}`,
  ])
  const repo: Repo | undefined = snapshot?.repositoryCid
    ? {
        cid: snapshot.repositoryCid,
        accountDid: snapshot.atprotoAccount,
        createdAt: new Date(snapshot.createdAt),
      }
    : undefined
  const { data: atBlobs } = useSWR<ATBlob[]>([
    'api',
    `/api/snapshots/${snapshotId}/blobs`,
  ])
  const blobs: Blob[] =
    atBlobs?.map((atBlob) => ({
      ...atBlob,
    })) ?? []
  const prefsDoc = useLiveQuery(() =>
    db.prefsDocs.where('backupId').equals(snapshotId).first()
  )
  const [isRestoringRepo, setIsRestoringRepo] = useState<boolean>(false)
  const [isRestoringBlobs, setIsRestoringBlobs] = useState<boolean>(false)
  const [isRestoringPrefsDoc, setIsRestoringPrefsDoc] = useState<boolean>(false)
  const [isTransferringIdentity, setIsTransferringIdentity] =
    useState<boolean>(false)
  const [isRepoRestored, setIsRepoRestored] = useState<boolean>(false)
  const [areBlobsRestored, setAreBlobsRestored] = useState<boolean>(false)
  const [isPrefsDocRestored, setIsPrefsDocRestored] = useState<boolean>(false)
  const [isIdentityTransferred, setIsIdentityTransferred] =
    useState<boolean>(false)
  const [sourceSession, setSourceSession] = useState<CredentialSession>()
  const [sourceAgent, setSourceAgent] = useState<Agent>()
  const [sinkSession, setSinkSession] = useState<CredentialSession>()
  const [sinkAgent, setSinkAgent] = useState<Agent>()
  const [plcOp, setPlcOp] = useState<Record<string, unknown>>()
  const [
    plceRestoreAuthorizationEmailSent,
    setPlcRestoreAuthorizationEmailSent,
  ] = useState<boolean>(false)
  const loginToSource: LoginFn = async (
    identifier: string,
    password: string,
    { server = ATPROTO_DEFAULT_SOURCE } = { server: ATPROTO_DEFAULT_SOURCE }
  ) => {
    const session = new CredentialSession(new URL(server))
    await session.login({ identifier, password })
    const agent = new Agent(session)
    setSourceSession(session)
    setSourceAgent(agent)
  }

  const loginToSink: LoginFn = async (
    identifier,
    password,
    { server = ATPROTO_DEFAULT_SINK } = { server: ATPROTO_DEFAULT_SINK }
  ) => {
    const session = new CredentialSession(new URL(server))
    await session.login({ identifier, password })
    const agent = new Agent(session)
    setSinkSession(session)
    setSinkAgent(agent)
  }

  const createAccount: CreateAccountFn = async (
    handle,
    password,
    email,
    { server = ATPROTO_DEFAULT_SINK, inviteCode } = {
      server: ATPROTO_DEFAULT_SINK,
    }
  ) => {
    if (sourceAgent && sourceSession) {
      const session = new CredentialSession(new URL(server))
      const agent = new Agent(session)

      const describeRes = await agent.com.atproto.server.describeServer()
      const newServerDid = describeRes.data.did

      // right now we need to talk to the source server to create this account with the given account DID
      const serviceJwtRes = await sourceAgent.com.atproto.server.getServiceAuth(
        {
          aud: newServerDid,
          lxm: 'com.atproto.server.createAccount',
        }
      )
      const serviceJwt = serviceJwtRes.data.token
      await agent.com.atproto.server.createAccount(
        {
          handle,
          email,
          password,
          did: sourceSession.did,
          inviteCode: inviteCode,
        },
        {
          headers: { authorization: `Bearer ${serviceJwt}` },
          encoding: 'application/json',
        }
      )
      await session.login({
        identifier: handle,
        password: password,
      })
      setSinkSession(session)
      setSinkAgent(agent)
    } else {
      console.warn('source agent not defined, need it to create a new account')
    }
  }

  async function sendPlcRestoreAuthorizationEmail() {
    if (sourceAgent) {
      await sourceAgent.com.atproto.identity.requestPlcOperationSignature()
      setPlcRestoreAuthorizationEmailSent(true)
    } else {
      console.warn(
        'could not send PLC operation authorization, sourceAgent is not truthy'
      )
    }
  }

  async function setupPlcRestore(plcToken: string) {
    if (sourceAgent && sinkAgent) {
      const recoveryKey = await Secp256k1Keypair.create({ exportable: true })

      const getDidCredentials =
        await sinkAgent.com.atproto.identity.getRecommendedDidCredentials()
      const rotationKeys = getDidCredentials.data.rotationKeys ?? []
      if (!rotationKeys) {
        throw new Error('No rotation key provided')
      }
      const plcOpResponse =
        await sourceAgent.com.atproto.identity.signPlcOperation({
          token: plcToken,
          rotationKeys: [recoveryKey.did(), ...rotationKeys],
          ...getDidCredentials.data,
        })
      setPlcOp(plcOpResponse.data.operation)
    } else {
      console.warn('could not create plcOp:', sourceAgent, sinkAgent, plcToken)
    }
  }

  async function restoreRepo() {
    if (repo && sinkAgent) {
      setIsRestoringRepo(true)
      console.log('restoring repo', repo.cid)
      await sinkAgent.com.atproto.repo.importRepo(
        new Uint8Array(await loadCid(repo.cid, repo.encryptedWith)),
        {
          encoding: 'application/vnd.ipld.car',
        }
      )
      setIsRestoringRepo(false)
      setIsRepoRestored(true)
    } else {
      console.warn('not restoring:', repo, sinkAgent)
    }
  }

  async function restoreBlobs() {
    if (blobs && sinkAgent) {
      setIsRestoringBlobs(true)
      for (const blob of blobs) {
        console.log('restoring blob', blob.cid)
        await sinkAgent.com.atproto.repo.uploadBlob(
          new Uint8Array(await loadCid(blob.cid, blob.encryptedWith)),
          {
            encoding: blob.contentType,
          }
        )
      }
      setIsRestoringBlobs(false)
      setAreBlobsRestored(true)
    } else {
      console.warn('not restoring:', blobs, sinkAgent)
    }
  }

  async function loadCid(
    cid: string,
    encryptedWith?: string
  ): Promise<ArrayBuffer> {
    const response = await fetch(cidUrl(cid))
    if (encryptedWith) {
      const key = keys.find((k) => k.id === encryptedWith)
      if (!key) {
        throw new Error('could not find key')
      } else {
        return await decrypt(key, await response.arrayBuffer())
      }
    } else {
      return await response.arrayBuffer()
    }
  }

  async function restorePrefsDoc() {
    if (prefsDoc && sinkAgent) {
      setIsRestoringPrefsDoc(true)
      const prefs = JSON.parse(
        new TextDecoder().decode(
          await loadCid(prefsDoc.cid, prefsDoc.encryptedWith)
        )
      )
      await sinkAgent.app.bsky.actor.putPreferences(prefs)
      setIsRestoringPrefsDoc(false)
      setIsPrefsDocRestored(true)
    } else {
      throw new Error(`not restoring:${prefsDoc} to ${sinkAgent}`)
    }
  }

  async function transferIdentity() {
    if (sourceAgent && sinkAgent && plcOp) {
      setIsTransferringIdentity(true)
      await sinkAgent.com.atproto.identity.submitPlcOperation({
        operation: plcOp,
      })
      await sinkAgent.com.atproto.server.activateAccount()
      // TODO: I think we need to do this to be complete, but it currently throws an error
      //await sourceAgent.com.atproto.server.deactivateAccount()
      setIsTransferringIdentity(false)
      setIsIdentityTransferred(true)
    } else {
      console.warn('not transferring identity: ', sinkAgent, plcOp)
    }
  }

  return (
    <>
      <RestoreDialogView
        keys={keys}
        sourceSession={sourceSession}
        sinkSession={sinkSession}
        loginToSink={loginToSink}
        loginToSource={loginToSource}
        createAccount={createAccount}
        restoreRepo={restoreRepo}
        restoreBlobs={restoreBlobs}
        restorePrefsDoc={restorePrefsDoc}
        transferIdentity={transferIdentity}
        sendPlcRestoreAuthorizationEmail={sendPlcRestoreAuthorizationEmail}
        isPlcRestoreAuthorizationEmailSent={plceRestoreAuthorizationEmailSent}
        setupPlcRestore={setupPlcRestore}
        isPlcRestoreSetup={!!plcOp}
        repo={repo}
        blobs={blobs}
        prefsDoc={prefsDoc}
        isRestoringRepo={isRestoringRepo}
        isRestoringBlobs={isRestoringBlobs}
        isRestoringPrefsDoc={isRestoringPrefsDoc}
        isTransferringIdentity={isTransferringIdentity}
        isRepoRestored={isRepoRestored}
        areBlobsRestored={areBlobsRestored}
        isPrefsDocRestored={isPrefsDocRestored}
        isIdentityTransferred={isIdentityTransferred}
      />
    </>
  )
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
