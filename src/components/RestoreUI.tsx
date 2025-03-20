'use client'

import db, { Blob, PrefsDoc, Repo } from "@/lib/db"
import { Agent, CredentialSession } from '@atproto/api'
import { blueskyClientMetadata, decrypt } from "@/lib/bluesky"
import { useLiveQuery } from "dexie-react-hooks"
import { OAuthSession, BrowserOAuthClient } from "@atproto/oauth-client-browser";
import { ATPROTO_DEFAULT_SINK, ATPROTO_DEFAULT_SOURCE, REQUIRED_ATPROTO_SCOPE } from "@/lib/constants";
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Secp256k1Keypair } from "@atproto/crypto"
import { AdjustmentsHorizontalIcon, ArrowRightCircleIcon, CircleStackIcon, CloudIcon, IdentificationIcon, KeyIcon } from "@heroicons/react/20/solid"
import { shorten, shortenDID } from "@/lib/ui"
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import Button from "./Button"
import Input from "./Input"
import { Key, useKeychainContext } from "@/contexts/keychain"
import Keychain from "./Keychain"
import { cidUrl } from "@/lib/storacha"

type LoginFn = (identifier: string, password: string, options?: { server?: string }) => Promise<void>

interface LoginForm {
  handle: string
  password: string
  server: string
}

interface AtprotoLoginFormProps {
  login: LoginFn
  defaultServer?: string
}

interface PlcTokenFormParams {
  token: string
}

type CreateAccountFn = (handle: string, password: string, email: string, options?: { server?: string, inviteCode?: string }) => Promise<void>

type CreateAccountForm = LoginForm & {
  email: string
  inviteCode?: string
}

interface AtprotoCreateAccountFormProps {
  createAccount: CreateAccountFn
  defaultServer?: string
}


export async function oauthToPds (pdsUrl: string, handle: string) {
  const bskyAuthClient = new BrowserOAuthClient({
    clientMetadata: blueskyClientMetadata,
    handleResolver: pdsUrl,
  });
  const result = await bskyAuthClient.init(true);
  const { session } = result as {
    session: OAuthSession;
  };
  const agent = new Agent(session)
  await bskyAuthClient.signIn(handle, {
    scope: REQUIRED_ATPROTO_SCOPE,
  })
  return { client: bskyAuthClient, session, agent }
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

export default function RestoreDialog ({ backupId }: { backupId: number }) {
  const { keys } = useKeychainContext()
  const repo = useLiveQuery(() => db.
    repos.where('backupId').equals(backupId).first())
  const blobs = useLiveQuery(() => db.
    blobs.where('backupId').equals(backupId).toArray())
  const prefsDoc = useLiveQuery(() => db.
    prefsDocs.where('backupId').equals(backupId).first())
  const [isRestoringRepo, setIsRestoringRepo] = useState<boolean>(false)
  const [isRestoringBlobs, setIsRestoringBlobs] = useState<boolean>(false)
  const [isRestoringPrefsDoc, setIsRestoringPrefsDoc] = useState<boolean>(false)
  const [isTransferringIdentity, setIsTransferringIdentity] = useState<boolean>(false)
  const [isRepoRestored, setIsRepoRestored] = useState<boolean>(false)
  const [areBlobsRestored, setAreBlobsRestored] = useState<boolean>(false)
  const [isPrefsDocRestored, setIsPrefsDocRestored] = useState<boolean>(false)
  const [isIdentityTransferred, setIsIdentityTransferred] = useState<boolean>(false)
  const [sourceSession, setSourceSession] = useState<CredentialSession>()
  const [sourceAgent, setSourceAgent] = useState<Agent>()
  const [sinkSession, setSinkSession] = useState<CredentialSession>()
  const [sinkAgent, setSinkAgent] = useState<Agent>()
  const [plcOp, setPlcOp] = useState<unknown>()
  const [plceRestoreAuthorizationEmailSent, setPlcRestoreAuthorizationEmailSent] = useState<boolean>(false)
  const loginToSource: LoginFn = async (identifier: string, password: string, { server = ATPROTO_DEFAULT_SOURCE } = { server: ATPROTO_DEFAULT_SOURCE }) => {
    const session = new CredentialSession(new URL(server))
    await session.login({ identifier, password })
    const agent = new Agent(session)
    setSourceSession(session)
    setSourceAgent(agent)
  }

  const loginToSink: LoginFn = async (identifier, password, { server = ATPROTO_DEFAULT_SINK } = { server: ATPROTO_DEFAULT_SINK }) => {
    const session = new CredentialSession(new URL(server))
    await session.login({ identifier, password })
    const agent = new Agent(session)
    setSinkSession(session)
    setSinkAgent(agent)
  }

  const createAccount: CreateAccountFn = async (handle, password, email, { server = ATPROTO_DEFAULT_SINK, inviteCode } = { server: ATPROTO_DEFAULT_SINK }) => {
    if (sourceAgent && sourceSession) {
      const session = new CredentialSession(new URL(server))
      const agent = new Agent(session)

      const describeRes = await agent.com.atproto.server.describeServer()
      const newServerDid = describeRes.data.did

      // right now we need to talk to the source server to create this account with the given account DID
      const serviceJwtRes = await sourceAgent.com.atproto.server.getServiceAuth({
        aud: newServerDid,
        lxm: 'com.atproto.server.createAccount',
      })
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
        },
      )
      await session.login({
        identifier: handle,
        password: password,
      })
      setSinkSession(session)
      setSinkAgent(agent)
    } else {
      console.warn("source agent not defined, need it to create a new account")
    }
  }

  async function sendPlcRestoreAuthorizationEmail () {
    if (sourceAgent) {
      await sourceAgent.com.atproto.identity.requestPlcOperationSignature()
      setPlcRestoreAuthorizationEmailSent(true)
    } else {
      console.warn('could not send PLC operation authorization, sourceAgent is not truthy')
    }
  }

  async function setupPlcRestore (plcToken: string) {
    if (sourceAgent && sinkAgent) {
      const recoveryKey = await Secp256k1Keypair.create({ exportable: true })

      const getDidCredentials =
        await sinkAgent.com.atproto.identity.getRecommendedDidCredentials()
      const rotationKeys = getDidCredentials.data.rotationKeys ?? []
      if (!rotationKeys) {
        throw new Error('No rotation key provided')
      }
      const plcOpResponse = await sourceAgent.com.atproto.identity.signPlcOperation({
        token: plcToken,
        rotationKeys: [recoveryKey.did(), ...rotationKeys],
        ...getDidCredentials.data
      })
      setPlcOp(plcOpResponse.data.operation)
    } else {
      console.warn("could not create plcOp:", sourceAgent, sinkAgent, plcToken)
    }
  }

  async function restoreRepo () {
    if (repo && sinkAgent) {
      setIsRestoringRepo(true)
      console.log("restoring repo", repo.cid)
      await sinkAgent.com.atproto.repo.importRepo(new Uint8Array(
        await loadCid(repo.cid, repo.encryptedWith)
      ), {
        encoding: 'application/vnd.ipld.car',
      })
      setIsRestoringRepo(false)
      setIsRepoRestored(true)
    } else {
      console.warn('not restoring:', repo, sinkAgent)
    }
  }

  async function restoreBlobs () {
    if (blobs && sinkAgent) {
      setIsRestoringBlobs(true)
      for (const blob of blobs) {
        console.log("restoring blob", blob.cid)
        await sinkAgent.com.atproto.repo.uploadBlob(new Uint8Array(
          await loadCid(blob.cid, blob.encryptedWith)
        ), {
          encoding: blob.contentType,
        })
      }
      setIsRestoringBlobs(false)
      setAreBlobsRestored(true)
    } else {
      console.warn('not restoring:', blobs, sinkAgent)
    }
  }

  async function loadCid (cid: string, encryptedWith?: string): Promise<ArrayBuffer> {
    const response = await fetch(cidUrl(cid))
    if (encryptedWith) {
      const key = keys.find(k => k.id === encryptedWith)
      if (!key) {
        throw new Error('could not find key')
      } else {
        return await decrypt(key, await response.arrayBuffer())
      }
    } else {
      return await response.arrayBuffer()
    }
  }

  async function restorePrefsDoc () {
    if (prefsDoc && sinkAgent) {
      setIsRestoringPrefsDoc(true)
      const prefs = JSON.parse(new TextDecoder().decode(
        await loadCid(prefsDoc.cid, prefsDoc.encryptedWith))
      )
      await sinkAgent.app.bsky.actor.putPreferences(prefs)
      setIsRestoringPrefsDoc(false)
      setIsPrefsDocRestored(true)
    } else {
      throw new Error(`not restoring:${prefsDoc} to ${sinkAgent}`)
    }
  }

  async function transferIdentity () {
    if (sinkAgent && plcOp) {
      setIsTransferringIdentity(true)
      await sinkAgent.com.atproto.identity.submitPlcOperation({
        operation: plcOp,
      })
      await sinkAgent.com.atproto.server.activateAccount()
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

export function RestoreDialogView ({
  sourceSession,
  sinkSession,
  loginToSource,
  loginToSink,
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
  isIdentityTransferred
}: RestoreDialogViewProps) {
  const [showTransferAuthorization, setShowTransferAuthorization] = useState(false)
  return (
    <div>
      <Popover className="relative">
        <PopoverButton className="outline-none cursor-pointer hover:bg-gray-100 p-2">
          <KeyIcon className="w-6 h-6" />
        </PopoverButton>
        <PopoverPanel anchor="bottom" className="flex flex-col bg-white border rounded p-2">
          <Keychain />
        </PopoverPanel>
      </Popover>
      <div className="flex flex-row justify-evenly">
        <div>
          {sourceSession ? (
            sinkSession ? (
              <div className="flex flex-col">
                <div>
                  <div className="flex flex-row items-center w-full">
                    <div className="w-28"></div>
                    <div className="w-24">
                      <h4 className="text-center uppercase text-xs font-bold">
                        Storacha
                      </h4>
                    </div>
                    <div className="w-6 h-6">
                    </div>
                    <div className="w-24">
                      <h4 className="text-center uppercase text-xs font-bold">
                        {sinkSession?.pdsUrl?.hostname}
                      </h4>
                      <div className="text-xs w-full truncate">{sinkSession.did && shortenDID(sinkSession.did)}</div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center my-2 space-x-8">
                    <h5 className="font-bold uppercase text-sm text-right w-28">Repository</h5>
                    <Popover className="relative">
                      <PopoverButton className="outline-none">
                        <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                          <CircleStackIcon className="w-4 h-4" />
                        </div>
                      </PopoverButton>
                      <PopoverPanel anchor="bottom" className="flex flex-col bg-white border rounded p-2">
                        <div>
                          Account: {repo?.accountDid}
                        </div>
                        <div>
                          Created At: {repo?.createdAt.toDateString()}
                        </div>
                      </PopoverPanel>
                    </Popover>
                    {isRestoringRepo ? (
                      <Button 
                        isLoading
                        hideLoadingText
                        variant="outline"
                        className="rounded-full p-1.5"
                        aria-label="Restoring repository"
                      />
                    ) : (
                      <Button
                        onClick={restoreRepo} 
                        disabled={isRestoringRepo}
                        variant="outline"
                        className="rounded-full p-1.5"
                        leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                      />
                    )}
                    <div className={`${isRepoRestored ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                      <CircleStackIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex flex-row items-center my-2 space-x-8">
                    <h5 className="font-bold uppercase text-sm text-right w-28">Blobs</h5>
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
                        className="rounded-full p-1.5"
                        aria-label="Restoring blobs"
                      />
                    ) : (
                      <Button
                        onClick={restoreBlobs} 
                        disabled={isRestoringBlobs}
                        variant="outline"
                        className="rounded-full p-1.5"
                        leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                      />
                    )}
                    <div className={`${areBlobsRestored ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                      <CloudIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex flex-row items-center my-2 space-x-8">
                    <h5 className="font-bold uppercase text-sm text-right w-28">Preferences</h5>
                    <Popover className="relative">
                      <PopoverButton className="outline-none">
                        <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                          <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        </div>
                      </PopoverButton>
                      <PopoverPanel anchor="bottom" className="flex flex-col bg-white border rounded p-2">
                        <div>
                          Account: {prefsDoc?.accountDid}
                        </div>
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
                        className="rounded-full p-1.5"
                        aria-label="Restoring preferences"
                      />
                    ) : (
                      <Button
                        onClick={restorePrefsDoc} 
                        disabled={isRestoringPrefsDoc}
                        variant="outline"
                        className="rounded-full p-1.5"
                        leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                      />
                    )}
                    <div className={`${isPrefsDocRestored ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                      <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-row items-center w-full mt-8">
                    <div className="w-28"></div>
                    <div className="w-24">
                      <h4 className="text-center uppercase text-xs font-bold">
                        {sourceSession?.pdsUrl?.hostname && shorten(sourceSession?.pdsUrl?.hostname, 10)}
                      </h4>
                      <div className="text-xs w-full truncate">{sourceSession.did && shortenDID(sourceSession.did)}</div>
                    </div>
                    <div className="w-6 h-6">
                    </div>
                    <div className="w-24">
                      <h4 className="text-center uppercase text-xs font-bold">
                        {sinkSession?.pdsUrl?.hostname && shorten(sinkSession?.pdsUrl?.hostname, 10)}
                      </h4>
                      <div className="text-xs w-full truncate">{sinkSession.did && shortenDID(sinkSession.did)}</div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center my-2 space-x-8">
                    <h5 className="font-bold uppercase text-sm text-right w-28">Identity</h5>
                    <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                      <IdentificationIcon className="w-4 h-4" />
                    </div>
                    {isTransferringIdentity ? (
                      <Button 
                        isLoading
                        hideLoadingText
                        variant="outline"
                        className="rounded-full p-1.5"
                        aria-label="Transferring identity"
                      />
                    ) : (
                      isPlcRestoreAuthorizationEmailSent ? (
                        isPlcRestoreSetup ? (
                          <div className="flex flex-col items-center">
                            <Button
                              onClick={transferIdentity} 
                              disabled={isTransferringIdentity}
                              variant="outline"
                              className="rounded-full p-1.5 m-auto"
                              leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                            />
                            <Popover className="relative h-0 w-0">
                              <PopoverButton className="w-0 h-0"></PopoverButton>
                              <PopoverPanel static anchor="bottom" className="flex flex-col bg-white border rounded p-2">
                                <h5 className="w-56 m-auto text-center text-xs font-bold uppercase">
                                  Identity Transfer is not currently reversible, please use caution!
                                </h5>
                              </PopoverPanel>
                            </Popover>
                          </div>
                        ) : (
                          <PlcTokenForm setPlcToken={setupPlcRestore} />
                        )
                      ) : (
                        showTransferAuthorization ? (
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
                              <PopoverPanel static anchor="bottom" className="flex flex-col bg-white border rounded p-2">
                                <h5 className="w-56 m-auto text-center text-xs font-bold uppercase mt-2">
                                  To transfer your identity you must provide a confirmation code sent to the email registered with your current PDS host.
                                </h5>
                              </PopoverPanel>
                            </Popover>
                          </div>
                        ) : (
                          <Button
                            onClick={() => { setShowTransferAuthorization(true) }} 
                            disabled={isTransferringIdentity}
                            variant="outline"
                            className="rounded-full p-1.5"
                            leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                          />
                        )
                      )
                    )}

                    <div className={`${isIdentityTransferred ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                      <IdentificationIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div>

                </div>
              </div>
            ) : (
              <div className="my-4">
                <h3 className="font-bold">Authenticate to new Bluesky server</h3>
                <AtprotoLoginForm login={loginToSink} defaultServer={ATPROTO_DEFAULT_SINK} />
                <h4 className="font-bold">OR</h4>
                <h3 className="font-bold">Create a new Bluesky account</h3>
                <AtprotoCreateAccountForm createAccount={createAccount} defaultServer={ATPROTO_DEFAULT_SINK} />
              </div>
            )
          ) : (
            <div className="my-4">
              <h3 className="font-bold">Authenticate to current Bluesky server</h3>
              <AtprotoLoginForm login={loginToSource} defaultServer={ATPROTO_DEFAULT_SOURCE} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AtprotoLoginForm ({ login, defaultServer }: AtprotoLoginFormProps) {
  const {
    register,
    handleSubmit,
  } = useForm<LoginForm>()

  return (
    <form onSubmit={handleSubmit((data) => login(data.handle, data.password, { server: data.server || `https://${defaultServer}` }))}
      className="flex flex-col space-y-2">
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
        label="Password"
        type="password"
        {...register('password')}
      />
      <Button
        type="submit"
        variant="primary"
      >
        Log In
      </Button>
    </form>
  )
}

function PlcTokenForm ({ setPlcToken }: { setPlcToken: (token: string) => void }) {
  const {
    register,
    handleSubmit,
  } = useForm<PlcTokenFormParams>()

  return (
    <form onSubmit={handleSubmit((data) => setPlcToken(data.token))}
      className="flex flex-col space-y-2">
      <Input
        placeholder="Confirmation Code"
        {...register('token')}
      />
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

function AtprotoCreateAccountForm ({ createAccount, defaultServer }: AtprotoCreateAccountFormProps) {
  const {
    register,
    handleSubmit,
  } = useForm<CreateAccountForm>()

  return (
    <form onSubmit={handleSubmit((data) => createAccount(data.handle, data.password, data.email, {
      server: data.server || `https://${defaultServer}`,
      inviteCode: data.inviteCode
    }))}
      className="flex flex-col space-y-2">
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
      <Input
        label="Password"
        type="password"
        {...register('password')}
      />
      <Input
        label="Invite Code"
        {...register('inviteCode')}
      />
      <Button
        type="submit"
        variant="primary"
      >
        Log In
      </Button>
    </form>
  )
}

