'use client'

import { useAuthenticator } from '@storacha/ui-react'
import { LogOutButton } from './authentication'

export function LoggedIn() {
  const [{ accounts, spaces }] = useAuthenticator()
  return (
    <div>
      <h1>Logged In</h1>
      <p>You are logged in as {accounts[0].toEmail()}!</p>
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
      <LogOutButton>Log Out</LogOutButton>
    </div>
  )
}
