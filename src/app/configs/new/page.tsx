'use client'

import { styled } from 'next-yak'
import { shortenDID } from '@/lib/ui'
import { roundRectStyle, Stack } from '@/components/ui'
import { useAuthenticator } from '@storacha/ui-react'

// TODO: Deal with unauthenticated

const Outside = styled(Stack)`
  background-color: var(--color-gray-medium-light);
  min-height: 100vh;
  align-items: stretch;
  padding: 2rem;
`

const AccountSelector = styled.div`
  ${roundRectStyle}
  border-color: var(--color-gray-light);
  background-color: var(--color-white);
`

export default function NewConfig() {
  const [{ spaces }] = useAuthenticator()

  const blueskyAccounts = [
    {
      did: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
      handle: '@chalametoui.bsky.social',
    },
    {
      did: 'did:plc:vv44vwwbr3lmbjht3p5fd7wz',
      handle: '@isupposeichal.bsky.social',
    },
  ]

  return (
    <Outside>
      <Stack $direction="row" $gap="1rem" $even>
        <AccountSelector>
          <Stack>
            Bluesky
            <select>
              {blueskyAccounts.map((account) => (
                <option key={account.did} value={account.did}>
                  {account.handle}
                </option>
              ))}
              <hr />
              <option value="-">Log into a Bluesky account…</option>
            </select>
          </Stack>
        </AccountSelector>
        <AccountSelector>
          <Stack>
            Storacha
            <select>
              {spaces.map((space) => (
                <option key={space.did()} value={space.did()}>
                  {space.name}
                  {/* Em space */}
                  {' '}({shortenDID(space.did())})
                </option>
              ))}
            </select>
          </Stack>
        </AccountSelector>
      </Stack>
    </Outside>
  )
}
