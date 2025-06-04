// 'use client'

import { Agent, CredentialSession } from '@atproto/api'
import { useState } from 'react'

import { ATPROTO_DEFAULT_SINK } from '@/lib/constants'
import * as plc from '@/lib/crypto/plc'
import { createServiceJwt } from '@/lib/jwt'
import { createPlcUpdateOp } from '@/lib/plc'
import {
  ATServices,
  ATVerificationMethods,
  ProfileData,
  RotationKey,
} from '@/types'

import { CreateAccountFn, LoginFn } from '../ui/atproto'

import IdentityTransferView from './IdentityTransferView'

const isHttpUrl = (maybeUrl: string) =>
  maybeUrl.startsWith('https://') || maybeUrl.startsWith('http://')

const httpsify = (maybeUrl: string) =>
  isHttpUrl(maybeUrl) ? maybeUrl : `https://${maybeUrl}`

export function IdentityTransfer({
  profile,
  rotationKey,
}: {
  profile: ProfileData
  rotationKey: RotationKey
}) {
  const [sinkSession, setSinkSession] = useState<CredentialSession>()
  const [sinkAgent, setSinkAgent] = useState<Agent>()
  const [isTransferringIdentity, setIsTransferringIdentity] =
    useState<boolean>(false)
  const [isIdentityTransferred, setIsIdentityTransferred] =
    useState<boolean>(false)

  async function takeControl() {
    if (!profile) throw new Error('profile not defined, cannot take control')

    const op = await createPlcUpdateOp(profile, rotationKey, {
      verificationMethods: {
        ...profile.verificationMethods,
        atproto: rotationKey.id,
      },
    })
    const client = new plc.Client('https://plc.directory')
    await client.sendOperation(profile.did, op)
  }

  const loginToSink: LoginFn = async (
    identifier,
    password,
    { server = ATPROTO_DEFAULT_SINK } = { server: ATPROTO_DEFAULT_SINK }
  ) => {
    const session = new CredentialSession(new URL(httpsify(server)))
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
    if (!rotationKey.keypair) {
      throw new Error(
        'cannot create account - rotation key private key is not loaded'
      )
    }

    await takeControl()

    const session = new CredentialSession(new URL(httpsify(server)))
    const agent = new Agent(session)

    const describeRes = await agent.com.atproto.server.describeServer()
    const newServerDid = describeRes.data.did
    const serviceJwt = await createServiceJwt({
      iss: profile.did,
      aud: newServerDid,
      lxm: 'com.atproto.server.createAccount',
      keypair: rotationKey.keypair,
    })

    await agent.com.atproto.server.createAccount(
      {
        handle,
        email,
        password,
        did: profile.did,
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
  }

  async function transferIdentity() {
    if (!sinkAgent)
      throw new Error('agent undefined, cannot transfer identity: ', sinkAgent)

    const { data } =
      await sinkAgent.com.atproto.identity.getRecommendedDidCredentials()
    if (!data) throw new Error()

    const { rotationKeys, services, verificationMethods, ...creds } = data
    const plcOp = await createPlcUpdateOp(profile, rotationKey, {
      ...creds,
      services: services as ATServices | undefined,
      verificationMethods: verificationMethods as
        | ATVerificationMethods
        | undefined,
      rotationKeys: [...(rotationKeys ?? []), rotationKey.id],
    })
    setIsTransferringIdentity(true)
    await sinkAgent.com.atproto.identity.submitPlcOperation({
      operation: plcOp,
    })
    await sinkAgent.com.atproto.server.activateAccount()
    setIsTransferringIdentity(false)
    setIsIdentityTransferred(true)
  }
  return (
    <IdentityTransferView
      profile={profile}
      loginToSink={loginToSink}
      createAccount={createAccount}
      transferIdentity={transferIdentity}
      sinkSession={sinkSession}
      isTransferringIdentity={isTransferringIdentity}
      isIdentityTransferred={isIdentityTransferred}
    />
  )
}
