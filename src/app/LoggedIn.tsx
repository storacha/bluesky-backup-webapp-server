'use client'

import { useEffect, useState } from 'react'
import { styled } from 'next-yak'
import { Account, Client, useAuthenticator } from '@storacha/ui-react'
import { Stack } from '@/components/ui'
import { atproto } from '@/lib/capabilities'
import { SERVER_DID } from '@/lib/constants'
import { Sidebar } from './Sidebar'
import { BackupScreen } from '../components/BackupScreen'
import { useSWR } from './swr'

const Outside = styled(Stack)`
  min-height: 100vh;
  align-items: stretch;
`

async function createSession(client: Client, account: Account) {
  const issuer = client.agent.issuer

  const delegation = await atproto.delegate({
    issuer: issuer,
    audience: { did: () => SERVER_DID },
    with: account.did(),
    proofs: client.proofs([{ can: atproto.can, with: account.did() }]),
  })
  const result = await delegation.archive()

  if (result.error) {
    throw result.error
  }
  const archivedDelegation = result.ok

  await fetch(`/session/create/${account.did()}`, {
    method: 'POST',
    body: archivedDelegation,
  })
}

export function LoggedIn() {
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]
  const { data: existingSessionDid, mutate } = useSWR(['api', '/session/did'])
  const noSession = existingSessionDid === 'no session'

  const [sessionCreationAttempted, setSessionCreationAttempted] =
    useState(false)

  useEffect(() => {
    // if the client & account are loaded, the session DID is erroring and we're
    // not currently creating a session, try to create one
    if (!sessionCreationAttempted && client && account && noSession) {
      ;(async () => {
        try {
          await createSession(client, account)
          await mutate()
        } finally {
          setSessionCreationAttempted(true)
        }
      })()
    }
  }, [sessionCreationAttempted, account, noSession, mutate, client])
  if (!account) return null
  return (
    <Outside $direction="row">
      <Sidebar selectedBackupId={null} />
      <BackupScreen />
    </Outside>
  )
}
