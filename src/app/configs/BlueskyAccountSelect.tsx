'use client'

import { useSWR } from '@/app/swr'
import { useAuthenticator } from '@storacha/ui-react'
import { useRef, ChangeEventHandler } from 'react'
import { LocationSelect } from './LocationSelect'

const LOG_INTO_BLUESKY_VALUE = '-'

export const BlueskyAccountSelect = (
  props: Omit<
    React.ComponentProps<typeof LocationSelect>,
    'onChange' | 'label'
  > & { value?: string }
) => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  const { data: atprotoAccounts } = useSWR(
    // We take "disabled" to mean not to show a select at all, so we don't need
    // options.
    props.disabled
      ? null
      : account && [
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
    <LocationSelect label="Bluesky" {...props} onChange={changeHandler}>
      {props.disabled
        ? props.value && <BlueskyOption did={props.value} />
        : atprotoAccounts && (
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
