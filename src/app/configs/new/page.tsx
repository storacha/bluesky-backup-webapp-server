// TODO: This whole page needs refactoring and breaking apart.

/** @jsxImportSource next-yak */
'use client'

import { ChangeEventHandler, useId, useRef } from 'react'
import { css, styled } from 'next-yak'
import { shortenDID } from '@/lib/ui'
import { Button, roundRectStyle, Stack } from '@/components/ui'
import { useAuthenticator } from '@storacha/ui-react'
import { useSWR } from '@/app/swr'
import { action } from './action'

// TODO: Deal with unauthenticated

const Outside = styled(Stack)`
  background-color: var(--color-gray-medium-light);
  min-height: 100vh;
  align-items: stretch;
  padding: 2rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  > * {
    flex: 1 1 0;
  }
`

const Box = styled.div`
  ${roundRectStyle}
  border-color: var(--color-gray-light);
  background-color: var(--color-white);

  /* TK: This seems unwise. We need this to force things to line up, but really
  we need a better strategy for these boxes changing size. */
  overflow: hidden;
`

const Checkbox = ({
  label,
  name,
  defaultChecked,
}: {
  label: string
  name: string
  defaultChecked?: boolean
}) => {
  const id = useId()
  return (
    <Box>
      <Stack
        $direction="row"
        $gap="0.5rem"
        // Style hack for now to override the CSS reset. Soon, we'll make this a
        // slider switch anyhow.
        css={css`
          & > input {
            appearance: auto;
          }
        `}
      >
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          name={name}
          type="checkbox"
          value="on"
          defaultChecked={defaultChecked}
        />
      </Stack>
    </Box>
  )
}

export default function NewConfig() {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  if (!account) return null

  return (
    <Outside>
      <form action={action}>
        <h1>
          {/* TODO: Provide a better default name */}
          <input type="text" name="name" defaultValue="New Config" />
        </h1>
        {/* We may not need to send the account as a form field once we have real auth. */}
        <input type="hidden" name="account" value={account.did()} />
        <h2>Accounts</h2>
        <Grid>
          <BlueskyAccountSelect name="bluesky_account" />
          <StorachaSpaceSelect name="storacha_space" />
        </Grid>
        <h2>Data</h2>
        <Grid>
          <Checkbox
            label="Repository"
            name="include_repository"
            defaultChecked
          />
          <Checkbox label="Blobs" name="include_blobs" defaultChecked />
          <Checkbox
            label="Preferences"
            name="include_preferences"
            defaultChecked
          />
        </Grid>
        <Button type="submit">Create Config</Button>
      </form>
    </Outside>
  )
}

const LOG_INTO_BLUESKY_VALUE = '-'

const BlueskyAccountSelect = ({ name }: { name: string }) => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  const { data: atprotoAccounts } = useSWR(
    account && [
      'api',
      '/api/atproto-accounts',
      {
        account: account.did(),
      },
    ]
  )

  // If we select LOG_INTO_BLUESKY_VALUE, don't tell `onChange` about it, just
  // set the value back to the previous value, and open the OAuth window.
  const currentValueRef = useRef('')
  const changeHandler: ChangeEventHandler<HTMLSelectElement> = async (e) => {
    const value = e.target.value
    if (value === LOG_INTO_BLUESKY_VALUE) {
      e.target.value = currentValueRef.current
      window.open('/atproto/connect', 'atproto-connect', 'popup')
    } else {
      currentValueRef.current = value
    }
  }

  return (
    <LocationSelect label="Bluesky" name={name} onChange={changeHandler}>
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
  const { data: handle, error } = useSWR(['atproto-handle', did])

  if (error) {
    console.error('Error fetching Bluesky handle:', error)
  }

  return (
    <option key={did} value={did}>
      {handle ? `@${handle}` : did}
    </option>
  )
}

const StorachaSpaceSelect = ({ name }: { name: string }) => {
  const [{ spaces, accounts }] = useAuthenticator()

  const account = accounts[0]

  return (
    <LocationSelect label="Storacha" name={name}>
      <optgroup label={account?.toEmail()}>
        {spaces.map((space) => (
          <option key={space.did()} value={space.did()}>
            {space.name}
            {/* Em space */}
            {' '}({shortenDID(space.did())})
          </option>
        ))}
      </optgroup>
    </LocationSelect>
  )
}

const LocationSelect = ({
  name,
  label,
  onChange,
  children,
}: {
  name: string
  label: string
  onChange?: ChangeEventHandler<HTMLSelectElement>
  children: React.ReactNode
}) => {
  const id = useId()

  return (
    <Box>
      <Stack>
        <label htmlFor={id}>{label}</label>
        <select id={id} name={name} onChange={onChange}>
          {children}
        </select>
      </Stack>
    </Box>
  )
}
