'use client'

import { useAuthenticator } from '@storacha/ui-react'
import { base64url } from 'multiformats/bases/base64'
import React, { useId } from 'react'
import useSWR from 'swr'
import { atproto } from '@/lib/capabilities'

const ConnectPage: React.FC = () => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  const delegation = useAtprotoDelegation()
  const handleId = useId()

  if (!account || !delegation) return null

  console.log('Delegation:', base64url.encode(delegation))

  return (
    <div>
      <h1>Connect to Bluesky</h1>
      <form action="/atproto/oauth" method="POST">
        <input type="hidden" name="account" value={account.did()} />
        <input type="hidden" name="ucan" value={base64url.encode(delegation)} />
        <div>
          <label htmlFor={handleId}>Bluesky handle:</label>
          <input
            type="text"
            id={handleId}
            name="handle"
            placeholder="Enter your handle"
            required
          />
        </div>
        <button type="submit">Connect</button>
      </form>
    </div>
  )
}

export default ConnectPage

const useAtprotoDelegation = () => {
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
        audience: { did: () => 'did:web:bskybackups.storacha.network' },
        with: account!.did(),
        proofs: client?.proofs([{can: atproto.can, with: account!.did()}])
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
