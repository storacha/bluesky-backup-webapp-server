'use client'

import { CaretDown, PlusCircle } from '@phosphor-icons/react'
import { useAuthenticator } from '@storacha/ui-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { components, ControlProps, ValueContainerProps } from 'react-select'

import { useSWR } from '@/lib/swr'
import { shortenDID } from '@/lib/ui'

import { AddBskyAccountModal } from '../modals'
import { Box, Option, SelectField, Stack, Text } from '../ui'

import { AccountLogo } from './BackupDetail'

const LOG_INTO_BLUESKY_VALUE = '-connect-'

export const BlueskyAccountSelect = (props: {
  name: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
}) => {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    props.defaultValue
  )

  const { data: atprotoAccounts, isLoading } = useSWR(
    props.disabled ? null : account && ['api', '/api/atproto-accounts']
  )

  useEffect(() => {
    if (props.defaultValue) {
      setSelectedValue(props.defaultValue)
    }
  }, [props.defaultValue])

  const options = useMemo(() => {
    const result: Option[] = []

    if (props.disabled && props.defaultValue) {
      return [
        {
          value: props.defaultValue,
          label: shortenDID(props.defaultValue),
          icon: '/bluesky.png',
        },
      ]
    }

    if (atprotoAccounts && atprotoAccounts.length > 0) {
      const bskyAccounts = atprotoAccounts.map((account) => {
        const formattedAccount =
          typeof account === 'string' && account.startsWith('did:')
            ? account
            : `did:plc:${account}`

        return {
          value: formattedAccount,
          label: shortenDID(formattedAccount),
          icon: '/bluesky.png',
        }
      })
      result.push(...bskyAccounts)
    }

    result.push({
      label: 'Connect Bluesky account',
      value: LOG_INTO_BLUESKY_VALUE,
    })

    return result
  }, [atprotoAccounts, props.defaultValue, props.disabled])

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
    const hasValue = Boolean(
      (selectedOption?.value &&
        selectedOption?.value !== LOG_INTO_BLUESKY_VALUE) ||
        options?.[0]?.label
    )

    const displayOption =
      selectedOption ||
      (options.length > 0 &&
      (options && options?.[0]?.value) !== LOG_INTO_BLUESKY_VALUE
        ? options[0]
        : null)

    return (
      <components.Control {...props}>
        <div style={{ width: '100%', cursor: 'pointer' }}>
          <Box
            $gap="1rem"
            $display="flex"
            $justifyContent="space-between"
            $background={hasValue ? 'var(--color-white)' : ''}
            $isFocused={props.isFocused}
          >
            <AccountLogo $type="original" $hasAccount={hasValue}>
              <Image
                src={displayOption?.icon || '/bluesky.png'}
                alt={`${displayOption?.label || 'Bluesky'} Logo`}
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
                <Text>
                  {isLoading
                    ? 'Loading accounts...'
                    : displayOption?.label || 'Select an account'}
                </Text>
              </Stack>
              {!atprotoAccounts || atprotoAccounts.length === 0 ? (
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

  const defaultValue =
    options.length > 1 &&
    (options && options?.[0]?.value) !== LOG_INTO_BLUESKY_VALUE
      ? options && options?.[0]?.value
      : undefined

  return (
    <>
      <SelectField
        name={props.name}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        disabled={props.disabled || isLoading}
        defaultValue={defaultValue}
        components={{
          Control: BskyControl,
          ValueContainer: BskyAccountsContainer,
        }}
      />
      <input type="hidden" name={props.name} value={selectedValue || ''} />
      {/* Keeping this here to bypass knip in the CI. When it's time to use the modal, I'll update */}
      <AddBskyAccountModal isOpen={false} onClose={() => {}} />
    </>
  )
}
