'use client'

import { useEffect, useId, useState } from 'react'
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
  const [blueskyAccount, setBlueskyAccount] = useState<string>()
  const [storachaSpace, setStorachaSpace] = useState<string>()

  return (
    <Outside>
      <Stack $direction="row" $gap="1rem" $even>
        <BlueskyAccountSelect
          value={blueskyAccount}
          onChange={(e) => {
            setBlueskyAccount(e.target.value)
          }}
        />
        <StorachaSpaceSelect
          value={storachaSpace}
          onChange={(e) => {
            setStorachaSpace(e.target.value)
          }}
        />
      </Stack>
    </Outside>
  )
}

const LOG_INTO_BLUESKY_VALUE = '-'

const BlueskyAccountSelect = ({
  value,
  onChange,
}: {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  const { data: atprotoAccounts } = useSWR<string[]>(
    account && [
      'api',
      '/api/atproto-accounts',
      {
        account: account.did(),
      },
    ]
  )

  // If the value is not set, attempt to set it to the first account.
  useEffect(() => {
    if (!value && atprotoAccounts && atprotoAccounts[0]) {
      onChange?.({
        target: {
          value: atprotoAccounts[0],
        },
      } as React.ChangeEvent<HTMLSelectElement>)
    }
  }, [atprotoAccounts, value, onChange])

  const changeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === LOG_INTO_BLUESKY_VALUE) {
      window.open('/atproto/connect', 'atproto-connect', 'popup')
    } else {
      onChange?.(e)
    }
  }

  return (
    <LocationSelect label="Bluesky" value={value} onChange={changeHandler}>
      {atprotoAccounts && (
        <>
          {atprotoAccounts.map((account) => (
            <BlueskyOption key={account} did={account} />
          ))}
          {atprotoAccounts.length === 0 && <option value="-"></option>}
          <hr />
          <option value={LOG_INTO_BLUESKY_VALUE}>
            Connect a Bluesky account…
          </option>
        </>
      )}
    </LocationSelect>
  )
}

const BlueskyOption = ({ did }: { did: string }) => {
  const { data: handle, error } = useSWR<string>(['atproto-handle', did])

  if (error) {
    console.error('Error fetching Bluesky handle:', error)
  }

  return (
    <option key={did} value={did}>
      {handle ? `@${handle}` : did}
    </option>
  )
}

const StorachaSpaceSelect = ({
  value,
  onChange,
}: {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => {
  const [{ spaces, accounts }] = useAuthenticator()

  const account = accounts[0]

  return (
    <LocationSelect label="Storacha" value={value} onChange={onChange}>
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
  value,
  onChange,
  children,
}: {
  label: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) => {
  const id = useId()

  return (
    <LocationSelectorBox>
      <Stack>
        <label htmlFor={id}>{label}</label>
        <select id={id} value={value} onChange={onChange}>
          {children}
        </select>
      </Stack>
    </LocationSelectorBox>
  )
}
