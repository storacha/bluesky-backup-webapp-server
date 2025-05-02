// 'use client'

import { Agent, CredentialSession } from '@atproto/api'
import { Secp256k1Keypair } from '@atproto/crypto'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import useSWR from 'swr'

import { ATBlob, Snapshot } from '@/app/types'
import { ATPROTO_DEFAULT_SINK, ATPROTO_DEFAULT_SOURCE } from '@/lib/constants'
import db from '@/lib/db'
import { cidUrl } from '@/lib/storacha'

import {
  Blob,
  CreateAccountFn,
  LoginFn,
  Repo,
  RestoreDialogView,
} from './RestoreDialogView'

export default function RestoreDialog({ snapshotId }: { snapshotId: string }) {
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
  const [isTransferringIdentity, setIsTransferringIdentity] =
    useState<boolean>(false)
  const [isRepoRestored, setIsRepoRestored] = useState<boolean>(false)
  const [areBlobsRestored, setAreBlobsRestored] = useState<boolean>(false)
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
    console.log('ignoring encryptedWith for now', encryptedWith)
    const response = await fetch(cidUrl(cid))
    return await response.arrayBuffer()
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
        sourceSession={sourceSession}
        sinkSession={sinkSession}
        loginToSink={loginToSink}
        loginToSource={loginToSource}
        createAccount={createAccount}
        restoreRepo={restoreRepo}
        restoreBlobs={restoreBlobs}
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
        isTransferringIdentity={isTransferringIdentity}
        isRepoRestored={isRepoRestored}
        areBlobsRestored={areBlobsRestored}
        isIdentityTransferred={isIdentityTransferred}
      />
    </>
  )
}
