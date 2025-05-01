// 'use client'

import { Agent, CredentialSession } from '@atproto/api'
import { Secp256k1Keypair } from '@atproto/crypto'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
  AdjustmentsHorizontalIcon,
  ArrowRightCircleIcon,
  CircleStackIcon,
  CloudIcon,
  IdentificationIcon,
  KeyIcon,
} from '@heroicons/react/20/solid'
import { useLiveQuery } from 'dexie-react-hooks'
import { styled } from 'next-yak'
import { InputHTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'

import { ATBlob, Snapshot } from '@/app/types'
import { Key, useKeychainContext } from '@/contexts/keychain'
import { decrypt } from '@/lib/bluesky'
import { ATPROTO_DEFAULT_SINK, ATPROTO_DEFAULT_SOURCE } from '@/lib/constants'
import db, { PrefsDoc } from '@/lib/db'
import { cidUrl } from '@/lib/storacha'
import { shortenDID } from '@/lib/ui'

import { Box } from './BackupScreen/BackupDetail'
import Keychain from './Keychain'
import { roundRectStyle } from './ui'
import { Button } from './ui/Button'

const InputElement = styled.input`
  border: 1px solid black;
  ${roundRectStyle};
  &::placeholder {
    opacity: 0.5;
  }
`
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}
const Input = (props: InputProps) => {
  const { label, ...rest } = props
  return label ? (
    <label>
      <div>{label}</div>
      <InputElement {...rest} />
    </label>
  ) : (
    <InputElement {...rest} />
  )
}

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

export default function RestoreDialog({ snapshotId }: { snapshotId: number }) {
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
      await sourceAgent.com.atproto.server.deactivateAccount()
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

function RestoreDialogView({
  sourceSession,
  sinkSession,
  loginToSource,
  createAccount,
  restoreRepo,
  restoreBlobs,
  restorePrefsDoc,
  transferIdentity,
  sendPlcRestoreAuthorizationEmail,
  isPlcRestoreAuthorizationEmailSent,
  setupPlcRestore,
  isPlcRestoreSetup,
  repo,
  blobs,
  prefsDoc,
  isRestoringRepo,
  isRestoringBlobs,
  isRestoringPrefsDoc,
  isTransferringIdentity,
  isRepoRestored,
  areBlobsRestored,
  isPrefsDocRestored,
  isIdentityTransferred,
}: RestoreDialogViewProps) {
  const [showTransferAuthorization, setShowTransferAuthorization] =
    useState(false)
  return (
    <Box $height="100%">
      {sourceSession ? (
        sinkSession ? (
          <div className="flex flex-col items-center">
            <div className="w-full flex flex-row">
              <Popover className="relative">
                <PopoverButton className="outline-none cursor-pointer hover:bg-gray-100 p-2">
                  <KeyIcon className="w-6 h-6" />
                </PopoverButton>
                <PopoverPanel
                  anchor="bottom"
                  className="flex flex-col bg-white border rounded p-2"
                >
                  <Keychain />
                </PopoverPanel>
              </Popover>
            </div>
            <div className="flex flex-col items-center">
              <div className="prose-sm text-center mb-4">
                <p>
                  Great 🎉 ! You can use the buttons below to <b>pull</b> your
                  data out of Storacha 🐔 and load it into your <b>new</b>{' '}
                  Personal Data Server 🖥️.
                </p>
                <p>
                  If your backup is <b>encrypted</b> 🔏 you&apos;ll need to
                  ensure the decryption key 🔑 is available. Use the key icon
                  above 👆 to <b>import</b> your private key if needed.
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="flex flex-row items-center w-full mb-4">
                  <div className="w-32"></div>
                  <div className="w-24">
                    <h4 className="text-center uppercase text-xs font-bold">
                      Storacha
                    </h4>
                  </div>
                  <div className="w-8 h-6"></div>
                  <div className="w-44">
                    <h4 className="text-center uppercase text-xs font-bold">
                      {sinkSession?.serviceUrl.hostname}
                    </h4>
                    <div className="text-center text-xs w-full truncate">
                      {sinkSession.did && shortenDID(sinkSession.did)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center my-2 space-x-12">
                  <h5 className="font-bold uppercase text-sm text-right w-28">
                    Repository
                  </h5>
                  <Popover className="relative">
                    <PopoverButton className="outline-none">
                      <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                        <CircleStackIcon className="w-4 h-4" />
                      </div>
                    </PopoverButton>
                    <PopoverPanel
                      anchor="bottom"
                      className="flex flex-col bg-white border rounded p-2"
                    >
                      <div>Account: {repo?.accountDid}</div>
                      <div>Created At: {repo?.createdAt.toDateString()}</div>
                    </PopoverPanel>
                  </Popover>
                  {isRestoringRepo ? (
                    <Button
                      isLoading
                      hideLoadingText
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      aria-label="Restoring repository"
                    />
                  ) : (
                    <Button
                      onClick={restoreRepo}
                      disabled={isRestoringRepo}
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                    />
                  )}
                  <div
                    className={`${isRepoRestored ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}
                  >
                    <CircleStackIcon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex flex-row items-center my-2 space-x-12">
                  <h5 className="font-bold uppercase text-sm text-right w-28">
                    Blobs
                  </h5>
                  <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                    <span className="font-bold text-sm ">
                      {blobs?.length || '0'}
                    </span>
                  </div>
                  {isRestoringBlobs ? (
                    <Button
                      isLoading
                      hideLoadingText
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      aria-label="Restoring blobs"
                    />
                  ) : (
                    <Button
                      onClick={restoreBlobs}
                      disabled={isRestoringBlobs}
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                    />
                  )}
                  <div
                    className={`${areBlobsRestored ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}
                  >
                    <CloudIcon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex flex-row items-center my-2 space-x-12">
                  <h5 className="font-bold uppercase text-sm text-right w-28">
                    Preferences
                  </h5>
                  <Popover className="relative">
                    <PopoverButton className="outline-none">
                      <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                      </div>
                    </PopoverButton>
                    <PopoverPanel
                      anchor="bottom"
                      className="flex flex-col bg-white border rounded p-2"
                    >
                      <div>Account: {prefsDoc?.accountDid}</div>
                      <div>
                        Created At: {prefsDoc?.createdAt.toDateString()}
                      </div>
                    </PopoverPanel>
                  </Popover>
                  {isRestoringPrefsDoc ? (
                    <Button
                      isLoading
                      hideLoadingText
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      aria-label="Restoring preferences"
                    />
                  ) : (
                    <Button
                      onClick={restorePrefsDoc}
                      disabled={isRestoringPrefsDoc}
                      variant="outline"
                      className="rounded-full w-8 h-8"
                      leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                    />
                  )}
                  <div
                    className={`${isPrefsDocRestored ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="prose-sm text-center mt-16">
                  <p>
                    You&apos;re locked in 🔐. All that&apos;s left is to send a
                    confirmation ✅ code to your email.
                  </p>
                  <p>
                    Be careful ⛔️ ! If you&apos;re transferring your identity
                    away from the Bluesky 🦋 PDS you can&apos;t currently go
                    back! You may lose access to your DMs 💅 there if you do
                    this.
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex flex-row items-center w-full mt-8 mb-4">
                    <div className="w-28"></div>
                    <div className="w-32">
                      <h4 className="text-center uppercase text-xs font-bold">
                        {sourceSession.serviceUrl.hostname}
                      </h4>
                      <div className="text-xs w-full truncate">
                        {sourceSession.did && shortenDID(sourceSession.did)}
                      </div>
                    </div>
                    <div className="w-8 h-6"></div>
                    <div className="w-32">
                      <h4 className="text-center uppercase text-xs font-bold">
                        {sinkSession.serviceUrl.hostname}
                      </h4>
                      <div className="text-center text-xs w-full truncate">
                        {sinkSession.did && shortenDID(sinkSession.did)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center my-2 space-x-12">
                    <h5 className="font-bold uppercase text-sm text-right w-28">
                      Identity
                    </h5>
                    <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                      <IdentificationIcon className="w-4 h-4" />
                    </div>
                    {isTransferringIdentity ? (
                      <Button
                        isLoading
                        hideLoadingText
                        variant="outline"
                        className="rounded-full w-8 h-8 "
                        aria-label="Transferring identity"
                      />
                    ) : isPlcRestoreAuthorizationEmailSent ? (
                      isPlcRestoreSetup ? (
                        <div className="flex flex-col items-center">
                          <Button
                            onClick={transferIdentity}
                            disabled={isTransferringIdentity}
                            variant="outline"
                            className="rounded-full w-8 h-8 m-auto"
                            leftIcon={
                              <ArrowRightCircleIcon className="w-6 h-6" />
                            }
                          />
                          <Popover className="relative h-0 w-0">
                            <PopoverButton className="w-0 h-0"></PopoverButton>
                            <PopoverPanel
                              static
                              anchor="bottom"
                              className="flex flex-col bg-white border rounded p-2"
                            >
                              <h5 className="w-56 m-auto text-center text-xs font-bold uppercase">
                                Identity Transfer is not currently reversible,
                                please use caution!
                              </h5>
                            </PopoverPanel>
                          </Popover>
                        </div>
                      ) : (
                        <PlcTokenForm setPlcToken={setupPlcRestore} />
                      )
                    ) : showTransferAuthorization ? (
                      <div className="flex flex-col w-24 items-center">
                        <Button
                          onClick={sendPlcRestoreAuthorizationEmail}
                          disabled={isTransferringIdentity}
                          variant="primary"
                          className="text-xs font-bold uppercase py-1 px-2"
                        >
                          Send Email
                        </Button>
                        <Popover className="relative h-0 w-0">
                          <PopoverButton className="w-0 h-0"></PopoverButton>
                          <PopoverPanel
                            static
                            anchor="bottom"
                            className="flex flex-col bg-white border rounded p-2"
                          >
                            <h5 className="w-56 m-auto text-center text-xs font-bold uppercase mt-2">
                              To transfer your identity you must provide a
                              confirmation code sent to the email registered
                              with your current PDS host.
                            </h5>
                          </PopoverPanel>
                        </Popover>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setShowTransferAuthorization(true)
                        }}
                        disabled={isTransferringIdentity}
                        variant="outline"
                        className="rounded-full w-8 h-8"
                        leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                      />
                    )}

                    <div
                      className={`${isIdentityTransferred ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}
                    >
                      <IdentificationIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-4 flex flex-col items-center ">
            <h3 className="font-bold mb-2">
              Create a new Bluesky account to restore to:
            </h3>
            <div className="w-96">
              <AtprotoCreateAccountForm
                createAccount={createAccount}
                defaultServer={ATPROTO_DEFAULT_SINK}
              />
            </div>
          </div>
        )
      ) : (
        <div className="my-8 flex flex-col items-center min-w-96 space-y-4">
          <div className="prose-sm text-center mb-4">
            <p>
              If you&apos;d like to transfer your identity 🪪 to a new{' '}
              <b>Personal Data Store</b> you can initiate that here by logging
              in 🪵 to your existing account.
            </p>
          </div>
          <h3 className="font-bold mb-2">
            Authenticate to your existing Personal Data Server:
          </h3>
          <div className="w-96">
            <AtprotoLoginForm
              login={loginToSource}
              defaultServer={ATPROTO_DEFAULT_SOURCE}
            />
          </div>
        </div>
      )}
    </Box>
  )
}

const AtprotoLoginFormElement = styled.form`
  display: flex;
  flex-direction: column;
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
    <AtprotoLoginFormElement onSubmit={onSubmit}>
      <Input
        label="Server"
        placeholder={`https://${defaultServer}`}
        {...register('server')}
      />
      <Input
        label="Handle"
        placeholder={`racha.${defaultServer}`}
        autoComplete="off"
        {...register('handle')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="off"
        {...register('password')}
      />
      <Button type="submit">Log In</Button>
    </AtprotoLoginFormElement>
  )
}

function PlcTokenForm({
  setPlcToken,
}: {
  setPlcToken: (token: string) => void
}) {
  const { register, handleSubmit } = useForm<PlcTokenFormParams>()

  return (
    <form
      onSubmit={handleSubmit((data) => setPlcToken(data.token))}
      className="flex flex-col space-y-2"
    >
      <Input placeholder="Confirmation Code" {...register('token')} />
      <Button
        type="submit"
        variant="primary"
        className="text-xs uppercase font-bold"
      >
        Confirm
      </Button>
    </form>
  )
}

function AtprotoCreateAccountForm({
  createAccount,
  defaultServer,
}: AtprotoCreateAccountFormProps) {
  const { register, handleSubmit } = useForm<CreateAccountForm>()

  return (
    <form
      onSubmit={handleSubmit((data) =>
        createAccount(data.handle, data.password, data.email, {
          server: data.server || `https://${defaultServer}`,
          inviteCode: data.inviteCode,
        })
      )}
      className="flex flex-col space-y-2 w-full"
    >
      <Input
        label="Server"
        placeholder={`https://${defaultServer}`}
        {...register('server')}
      />
      <Input
        label="Handle"
        placeholder={`racha.${defaultServer}`}
        {...register('handle')}
      />
      <Input
        label="Email"
        placeholder="racha@storacha.network"
        {...register('email')}
      />
      <Input label="Password" type="password" {...register('password')} />
      <Input label="Invite Code" {...register('inviteCode')} />
      <Button type="submit" variant="primary">
        Create Account
      </Button>
    </form>
  )
}
