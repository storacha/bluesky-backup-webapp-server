'use client'

import { Agent, CredentialSession } from '@atproto/api'
import { useState } from 'react'
import { mutate } from 'swr'

import { ATPROTO_DEFAULT_SOURCE } from '@/lib/constants'
import { ProfileData, RotationKey } from '@/types'

import { Loader } from '../../Loader'
import { LoginFn } from '../atproto'

import ConfirmAndInstall from './ConfirmAndInstall'
import LoginToServer from './LoginToServer'
import SendConfirmationEmail from './SendConfirmationEmail'

export default function AddRotationKey({
  profile,
  rotationKey,
  onDone,
}: {
  profile: ProfileData
  rotationKey: RotationKey
  onDone: () => void
}) {
  const {
    handle,
    rotationKeys: existingKeys,
    alsoKnownAs,
    services,
    verificationMethods,
  } = profile || {}
  const [agent, setAgent] = useState<Agent>()
  const [isInstallingRecoveryKey, setIsInstallingRecoveryKey] =
    useState<boolean>(false)
  const [isPlcAuthorizationEmailSent, setIsPlcAuthorizationEmailSent] =
    useState<boolean>(false)

  const loginToPDS: LoginFn = async (
    identifier: string,
    password: string,
    { server = ATPROTO_DEFAULT_SOURCE } = { server: ATPROTO_DEFAULT_SOURCE }
  ) => {
    const session = new CredentialSession(new URL(server))
    await session.login({ identifier, password })
    const agent = new Agent(session)
    setAgent(agent)
  }
  async function installRecoveryKey(plcToken: string) {
    if (!agent)
      throw new Error('could not create plcOp - sourceAgent not defined')
    if (!existingKeys) throw new Error('No rotation key provided')
    setIsInstallingRecoveryKey(true)
    try {
      const plcOpResponse = await agent.com.atproto.identity.signPlcOperation({
        token: plcToken,
        rotationKeys: [...existingKeys, rotationKey.id],
        alsoKnownAs,
        services,
        verificationMethods,
      })
      const plcSubmitResponse =
        await agent.com.atproto.identity.submitPlcOperation({
          operation: plcOpResponse.data.operation,
        })
      if (plcSubmitResponse.success) {
        mutate(['api', `/api/profile?did=${profile.did}`])
        onDone()
      } else {
      }
    } finally {
      setIsInstallingRecoveryKey(false)
    }
  }

  const server = services?.atproto_pds?.endpoint

  // I tried writing this a few different ways and this feels clearest - it's in the order
  // we expect users to encounter these screens
  if (!agent) {
    return (
      <LoginToServer server={server} handle={handle} loginToPDS={loginToPDS} />
    )
  }
  if (!isPlcAuthorizationEmailSent) {
    return (
      <SendConfirmationEmail
        server={server}
        agent={agent}
        onDone={() => setIsPlcAuthorizationEmailSent(true)}
      />
    )
  }
  if (!isInstallingRecoveryKey) {
    return <ConfirmAndInstall installRecoveryKey={installRecoveryKey} />
  }
  return <Loader />
}
