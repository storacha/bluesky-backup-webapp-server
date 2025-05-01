'use client'
import { CaretDown } from '@phosphor-icons/react'
import { useAuthenticator } from '@storacha/ui-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { components, ControlProps, ValueContainerProps } from 'react-select'

import { shortenDID } from '@/lib/ui'

import { Option, SelectField, Stack, Text } from '../ui'

import { AccountLogo, Box } from './BackupDetail'

export const StorachaSpaceSelect = (props: {
  name: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}) => {
  const [{ spaces, accounts }] = useAuthenticator()
  const account = accounts[0]
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
          icon: '/storacha-red.png',
        },
      ])
      return
    }

    const newOptions: Option[] = []

    if (spaces) {
      const spaceOptions = spaces.map((space) => ({
        value: space.did(),
        label: `${space.name} (${shortenDID(space.did())})`,
        icon: '/storacha-red.png',
        group: account?.toEmail(),
      }))

      newOptions.push(...spaceOptions)
    }

    setOptions(newOptions)
  }, [spaces, account, props.disabled, props.value])

  const handleChange = (value: string) => {
    setSelectedValue(value)
    if (props.onChange) {
      props.onChange(value)
    }
  }

  const StorachaControl = (props: ControlProps<Option>) => {
    const selectedOption = props.getValue()[0]
    const hasValue = Boolean(selectedOption?.value || options?.[0]?.label)
    return (
      <components.Control {...props}>
        <Box
          $gap="1rem"
          $display="flex"
          $background={hasValue ? 'var(--color-white)' : ''}
          $width="fit-content"
          $isFocused={props.isFocused}
        >
          <AccountLogo $type="original" $hasAccount={hasValue}>
            <Image
              src="/storacha-red.png"
              alt="Storacha Logo"
              width={18}
              height={18}
            />
          </AccountLogo>
          <Stack $justifyContent="space-between" $direction="row" $gap="1rem">
            <Stack $gap=".6rem">
              <Text $color="var(--color-black)">Storacha Space</Text>
              <Text>{selectedOption?.label || options?.[0]?.label}</Text>
            </Stack>
            <CaretDown size="16" color="var(--color-gray-1)" />
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
      </components.Control>
    )
  }

  const StorachaSpaceContainer = (props: ValueContainerProps<Option>) => {
    return (
      <components.ValueContainer {...props}>
        <div style={{ position: 'absolute', opacity: 0 }}>{props.children}</div>
      </components.ValueContainer>
    )
  }

  return (
    <SelectField
      name={props.name}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      disabled={props.disabled}
      defaultValue={options?.[0]?.value}
      components={{
        Control: StorachaControl,
        ValueContainer: StorachaSpaceContainer,
      }}
    />
  )
}
