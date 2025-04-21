'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { styled } from 'next-yak'
import { Account, Client, useAuthenticator } from '@storacha/ui-react'
import { Stack } from '@/components/ui'
import { atproto } from '@/lib/capabilities'
import { SERVER_DID } from '@/lib/constants'
import { Sidebar } from './Sidebar'

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
  const [{ accounts, spaces, client }] = useAuthenticator()
  const account = accounts[0]
  const {
    data: sessionDID,
    error: sessionDIDError,
    mutate,
  } = useSWR<string>('/session/did', async (url: string) => {
    const response = await fetch(url)
    const body = await response.text()
    if (response.status == 200) {
      return body
    } else {
      throw new Error(body)
    }
  })

  const [sessionCreationAttempted, setSessionCreationAttempted] =
    useState(false)

  useEffect(() => {
    // if the client & account are loaded, the session DID is erroring and we're
    // not currently creating a session, try to create one
    if (!sessionCreationAttempted && client && account && sessionDIDError) {
      ;(async () => {
        try {
          await createSession(client, account)
          await mutate()
        } finally {
          setSessionCreationAttempted(true)
        }
      })()
    }
  }, [sessionCreationAttempted, account, sessionDIDError, mutate, client])
  if (!account) return null
  return (
    <Outside $direction="row">
      <Sidebar selectedConfigId={null} />
      <div>
        <h1>Logged In</h1>
        <p>You are logged in as {account.toEmail()}!</p>
        <p>You have established a server session as {sessionDID}!</p>
        <h2>Spaces</h2>
        <ul>
          {spaces.map((space) => (
            <li key={space.did()}>
              <p>
                {space.name} ({space.did()})
              </p>
            </li>
          ))}
        </ul>
      </div>
      {/* you have this uncomment if you want to see the UI. but i guess that's what storybook is for */}
      {/* <BackupScreen /> */}
    </Outside>
  )
}
