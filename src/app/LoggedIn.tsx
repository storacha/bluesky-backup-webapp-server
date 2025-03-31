'use client'

import { useAuthenticator } from '@storacha/ui-react'
import { LogOutButton } from './authentication'
import { Stack } from '@/components/ui'
import { Sidebar } from './Sidebar'
import { styled } from 'next-yak'

const Outside = styled(Stack)`
  min-height: 100vh;
  align-items: stretch;
`

export function LoggedIn() {
  const [{ accounts, spaces }] = useAuthenticator()
  return (
    <Outside $direction="row" $gap="1rem">
      <Sidebar />
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
      </div>
    </Outside>
  )
}
