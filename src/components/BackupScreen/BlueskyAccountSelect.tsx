'use client'
import { useSWR } from '@/app/swr'
import { useAuthenticator } from '@storacha/ui-react'
import { useEffect, useState } from 'react'
import { Stack, Text } from '../ui'
import { CaretDown, PlusCircle } from '@phosphor-icons/react'
import { useDisclosure } from '@/hooks/use-disclosure'
import { AddBskyAccountModal } from '../modals'
import { SelectField, Option } from '../ui'
import { ControlProps, components } from 'react-select'
import { AccountLogo, Box } from './BackupDetail'
import Image from 'next/image'

const LOG_INTO_BLUESKY_VALUE = '-connect-'

export const BlueskyAccountSelect = (props: {
  name: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure({
    component: 'bsky-account',
  })
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  const { data: atprotoAccounts } = useSWR(
    props.disabled ? null : account && ['api', '/api/atproto-accounts']
  )

  const [options, setOptions] = useState<Option[]>([])
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    props.value
  )

  useEffect(() => {
    if (props.disabled && props.value) {
      setOptions([
        {
          value: props.value,
          label: props.value,
          icon: '/bluesky.png',
        },
      ])
      return
    }

    const newOptions: Option[] = []

    if (!atprotoAccounts) {
      newOptions.push({
        value: LOG_INTO_BLUESKY_VALUE,
        label: 'Connect a Bluesky account…',
        icon: '/bluesky.png',
      })
    }

    atprotoAccounts?.forEach((account) => {
      newOptions.push({
        value: account,
        label: `@${account.split('.')[0]}`,
        icon: '/bluesky.png',
      })
    })

    setOptions(newOptions)
  }, [atprotoAccounts, props.disabled, props.value])

  const handleChange = (value: string) => {
    if (value === LOG_INTO_BLUESKY_VALUE) {
      onOpen()
      return
    }

    setSelectedValue(value)
    if (props.onChange) {
      props.onChange(value)
    }
  }

  const BskyControl = (props: ControlProps<Option>) => {
    const selectedOption = props.getValue()[0]

    return (
      <components.Control {...props}>
        <div
          style={{ width: '100%', cursor: 'pointer' }}
          onClick={(e) => {
            if (!atprotoAccounts) {
              e.preventDefault()
              e.stopPropagation()
              onOpen()
            }
          }}
        >
          <Box
            $gap="1rem"
            $display="flex"
            $background={props.hasValue ? 'var(--color-white)' : ''}
          >
            <AccountLogo $type="original" $hasAccount={props.hasValue}>
              <Image
                src={selectedOption?.icon || '/bluesky.png'}
                alt={`${selectedOption?.label || 'Bluesky'} Logo`}
                width={25}
                height={25}
              />
            </AccountLogo>
            <Stack $justifyContent="space-between" $direction="row" $gap="1rem">
              <Stack $gap=".6rem">
                <Text $color="var(--color-black)">Bluesky Account</Text>
                <Text>{selectedOption?.label}</Text>
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
            </Stack>{' '}
          </Box>
        </div>
      </components.Control>
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
        components={{
          Control: BskyControl,
        }}
      />
      <AddBskyAccountModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
