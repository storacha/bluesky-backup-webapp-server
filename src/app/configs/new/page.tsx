'use client'

import { styled } from 'next-yak'
import { shortenDID } from '@/lib/ui'
import { roundRectStyle, Stack } from '@/components/ui'
import { useAuthenticator } from '@storacha/ui-react'
import useSWR from 'swr'

// TODO: Deal with unauthenticated

const Outside = styled(Stack)`
  background-color: var(--color-gray-medium-light);
  min-height: 100vh;
  align-items: stretch;
  padding: 2rem;
`

const LocationSelectorBox = styled.div`
  ${roundRectStyle}
  border-color: var(--color-gray-light);
  background-color: var(--color-white);
`

export default function NewConfig() {
  return (
    <Outside>
      <Stack $direction="row" $gap="1rem" $even>
        <BlueskyAccountSelect />
        <StorachaSpaceSelect />
      </Stack>
    </Outside>
  )
}

const BlueskyAccountSelect = () => {
  const { data: atprotoAccounts } = useSWR<
    {
      did: string
      handle: string
    }[]
  >('/api/atproto-accounts')

  return (
    <LocationSelect label="Bluesky">
      {atprotoAccounts && (
        <>
          {atprotoAccounts.map((account) => (
            <option key={account.did} value={account.did}>
              {account.handle}
            </option>
          ))}
          {atprotoAccounts.length === 0 && <option value="-"></option>}
          <hr />
          <option value="-">Log into a Bluesky account…</option>
        </>
      )}
    </LocationSelect>
  )
}

const StorachaSpaceSelect = () => {
  const [{ spaces, accounts }] = useAuthenticator()

  const account = accounts[0]

  return (
    <LocationSelect label="Storacha">
      {account && (
        <optgroup label={account.toEmail()}>
          {spaces.map((space) => (
            <option key={space.did()} value={space.did()}>
              {space.name}
              {/* Em space */}
              {' '}({shortenDID(space.did())})
            </option>
          ))}
        </optgroup>
      )}
    </LocationSelect>
  )
}

const LocationSelect = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => {
  return (
    <LocationSelectorBox>
      <Stack>
        {label}
        <select>{children}</select>
      </Stack>
    </LocationSelectorBox>
  )
}
