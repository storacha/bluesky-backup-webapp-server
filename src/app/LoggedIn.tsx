'use client'

import { useAuthenticator } from '@storacha/ui-react'
import { Stack } from '@/components/ui'
import { Sidebar } from './Sidebar'
import { styled } from 'next-yak'
import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { atproto } from '@/lib/capabilities'
import { SERVER_DID } from '@/lib/constants'

const Outside = styled(Stack)`
  min-height: 100vh;
  align-items: stretch;
`

const useAtprotoDelegation = (): Uint8Array | undefined => {
  const [{ client, accounts }] = useAuthenticator()
  const account = accounts[0]

  const issuer = client?.agent?.issuer

  // Use regular SWR, not our wrapper, because we need to use an inline fetcher
  // for access to the `issuer`, which doesn't serialize well into a key.
  return useSWR(
    () => [
      'delegation',
      // When client or account is null, the key function will fail, signalling
      // SWR not to fetch. Thus, we use `!` here.
      { issuer: issuer!.did(), account: account!.did() },
    ],
    async () => {
      const delegation = await atproto.delegate({
        issuer: issuer!,
        audience: { did: () => SERVER_DID },
        with: account!.did(),
        proofs: client?.proofs([{ can: atproto.can, with: account!.did() }])
      })
      const result = await delegation.archive()

      if (result.error) {
        throw result.error
      } else {
        return result.ok
      }
    }
  ).data
}

export function LoggedIn () {
  const [{ accounts, spaces }] = useAuthenticator()
  const account = accounts[0]
  const { data: sessionDID, error: sessionDIDError, mutate } = useSWR<string>(
    '/session/did',
    async (url: string) => {
      const response = await fetch(url)
      const body = await response.text()
      if (response.status == 200) {
        return body
      } else {
        throw new Error(body)
      }
    }
  )

  const delegation = useAtprotoDelegation()
  const createSession = useCallback(async function createSession () {
    if (account) {
      await fetch(`/session/create/${account.did()}`,
        {
          method: 'POST',
          body: delegation
        })
      await mutate()
    } else {
      throw new Error('no account, could not create session')
    }
  }, [account, delegation, mutate])

  const [sessionCreationAttempted, setSessionCreationAttempted] = useState(false)
  useEffect(() => {
    // if the account is loaded, the session DID is erroring and we're not
    // currently creating a session, try to create one
    if (!sessionCreationAttempted && account && sessionDIDError) {
      (async () => {
        try {
          await createSession()
          await mutate()
        } finally {
          setSessionCreationAttempted(true)
        }
      })()
    }
  }, [sessionCreationAttempted, account, sessionDIDError, mutate, createSession])

  return (
    <Outside $direction="row" $gap="1rem">
      <Sidebar selectedConfigId={null} />
      <div>
        <h1>Logged In</h1>
        <p>You are logged in as {account?.toEmail()}!</p>
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
    </Outside>
  )
}
