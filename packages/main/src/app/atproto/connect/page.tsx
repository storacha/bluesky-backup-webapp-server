'use client'

import { useAuthenticator } from '@storacha/ui-react'
import React, { useId } from 'react'

const ConnectPage: React.FC = () => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  const handleId = useId()
  if (!account) return null

  return (
    <div>
      <h1>Connect to Bluesky</h1>
      <form action="/atproto/oauth" method="POST">
        <input type="hidden" name="account" value={account.did()} />
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
