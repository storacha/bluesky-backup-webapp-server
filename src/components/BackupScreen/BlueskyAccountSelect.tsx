'use client'

import { PlusCircle } from '@phosphor-icons/react'
import { useAuthenticator } from '@storacha/ui-react'
import Image from 'next/image'
import { ChangeEventHandler, useRef } from 'react'

import { useSWR } from '@/app/swr'
import { useDisclosure } from '@/hooks/use-disclosure'

import { LocationSelect } from '../../app/backups/LocationSelect'
import { AddBskyAccountModal } from '../modals'
import { Stack } from '../ui'

import { AccountLogo, Box } from './BackupDetail'

const LOG_INTO_BLUESKY_VALUE = '-'

export const BlueskyAccountSelect = (
  props: Omit<
    React.ComponentProps<typeof LocationSelect>,
    'onChange' | 'label'
  > & { value?: string }
) => {
  const { isOpen, onOpen, onClose } = useDisclosure({
    component: 'bsky-account',
  })
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  const { data: atprotoAccounts } = useSWR(
    // We take "disabled" to mean not to show a select at all, so we don't need
    // options.
    props.disabled ? null : account && ['api', '/api/atproto-accounts']
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

  const selectElement = useRef<HTMLSelectElement>(null)
  const hasValue = Boolean(selectElement.current?.value)
  return (
    <>
      <Box $background={hasValue ? 'var(--color-white)' : ''}>
        <Stack $gap=".8rem" $direction="row" $alignItems="center">
          <AccountLogo $type="original" $hasAccount={hasValue}>
            <Image
              src="/bluesky.png"
              alt="Bluesky Logo"
              width={25}
              height={25}
            />
          </AccountLogo>
          <LocationSelect
            label="Bluesky Account"
            {...props}
            onChange={changeHandler}
            ref={selectElement}
          >
            {props.disabled
              ? props.value && <BlueskyOption did={props.value} />
              : atprotoAccounts && (
                  <>
                    {atprotoAccounts.map((account) => (
                      <BlueskyOption key={account} did={account} />
                    ))}
                    {atprotoAccounts.length === 0 && (
                      <option value="-"></option>
                    )}
                    <hr />
                    <option value={LOG_INTO_BLUESKY_VALUE}>
                      Connect a Bluesky account…
                    </option>
                  </>
                )}
          </LocationSelect>
        </Stack>
        <PlusCircle
          weight="fill"
          size="16"
          color="var(--color-gray-1)"
          onClick={onOpen}
        />
      </Box>

      <AddBskyAccountModal isOpen={isOpen} onClose={onClose} />
    </>
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
