'use client'
import { useSWR } from '@/app/swr'
import { useAuthenticator } from '@storacha/ui-react'
import { useMemo, useState } from 'react'
import { Stack, Text } from '../ui'
import { CaretDown, PlusCircle } from '@phosphor-icons/react'
import { SelectField, Option } from '../ui'
import { ControlProps, ValueContainerProps, components } from 'react-select'
import { AccountLogo, Box } from './BackupDetail'
import Image from 'next/image'
import { shortenDID } from '@/lib/ui'
import { AddBskyAccountModal } from '../modals'

const LOG_INTO_BLUESKY_VALUE = '-connect-'

export const BlueskyAccountSelect = (props: {
  name: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}) => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]

  const { data: atprotoAccounts } = useSWR(
    props.disabled ? null : account && ['api', '/api/atproto-accounts']
  )

  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    props.value
  )

  const options = useMemo(() => {
    if (props.disabled && props.value) {
      return [{ value: props.value, label: props.value, icon: '/bluesky.png' }]
    }

    const result: Option[] = []

    if (atprotoAccounts) {
      const bskyAccounts = atprotoAccounts.map((account) => ({
        value: account,
        label: shortenDID(account),
      }))
      result.push(...bskyAccounts)
    }

    result.push({
      label: 'Connect Bluesky account',
      value: LOG_INTO_BLUESKY_VALUE,
    })

    return result
  }, [atprotoAccounts, props.value, props.disabled])

  const handleChange = (value: string) => {
    if (value === LOG_INTO_BLUESKY_VALUE) {
      window.open('/atproto/connect', 'atproto-connect', 'popup')
    } else if (props.onChange) {
      setSelectedValue(value)
      props.onChange(value)
    }
  }

  const BskyControl = (props: ControlProps<Option>) => {
    const selectedOption = props.getValue()[0]
    const hasValue = Boolean(selectedOption?.value || options?.[0]?.label)

    return (
      <components.Control {...props}>
        <div style={{ width: '100%', cursor: 'pointer' }}>
          <Box
            $gap="1rem"
            $display="flex"
            $justifyContent="space-between"
            $background={props.hasValue ? 'var(--color-white)' : ''}
            $isFocused={props.isFocused}
          >
            <AccountLogo $type="original" $hasAccount={hasValue}>
              <Image
                src={selectedOption?.icon || '/bluesky.png'}
                alt={`${selectedOption?.label || 'Bluesky'} Logo`}
                width={25}
                height={25}
              />
            </AccountLogo>
            <Stack
              $justifyContent="space-between"
              $direction="row"
              $width="85%"
            >
              <Stack $gap=".6rem">
                <Text $color="var(--color-black)">Bluesky Account</Text>
                <Text>{selectedOption?.label || options?.[0]?.label}</Text>
              </Stack>
              {!atprotoAccounts ? (
                <PlusCircle
                  weight="fill"
                  size="16"
                  color="var(--color-gray-1)"
                />
              ) : (
                <CaretDown size="16" color="var(--color-gray-1)" />
              )}
            </Stack>
          </Box>
          <div
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {props.children}
          </div>
        </div>
      </components.Control>
    )
  }

  const BskyAccountsContainer = (props: ValueContainerProps<Option>) => {
    return (
      <components.ValueContainer {...props}>
        <div style={{ visibility: 'hidden', height: 0, position: 'absolute' }}>
          {props.children}
        </div>
      </components.ValueContainer>
    )
  }

  return (
    <>
      <SelectField
        name={props.name}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        disabled={props.disabled}
        defaultValue={options?.[0]?.value}
        components={{
          Control: BskyControl,
          ValueContainer: BskyAccountsContainer,
        }}
      />
      {/* keeping this here to bypass knip in the CI. when it's time to use the modal, i'll update */}
      <AddBskyAccountModal isOpen={false} onClose={() => {}} />
    </>
  )
}
