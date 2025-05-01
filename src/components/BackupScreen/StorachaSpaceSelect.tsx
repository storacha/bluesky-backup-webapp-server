'use client'
import { CaretDown } from '@phosphor-icons/react'
import { useAuthenticator } from '@storacha/ui-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { components, ControlProps, ValueContainerProps } from 'react-select'

import { useDisclosure } from '@/hooks/use-disclosure'
import { shortenDID } from '@/lib/ui'

import { Option, SelectField, Stack, Text } from '../ui'

import { AccountLogo, Box } from './BackupDetail'
import { CreateSpaceModal } from '../modals'

const CREATE_NEW_STORACHA_SPACE_VALUE = '-create-'

export const StorachaSpaceSelect = (props: {
  name: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [{ spaces, accounts }] = useAuthenticator()
  const account = accounts?.[0]
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    props.value
  )

  const options = useMemo(() => {
    if (props.disabled && props.value) {
      return [
        { value: props.value, label: props.value, icon: '/storacha-red.png' },
      ]
    }
    const result: Option[] = []

    if (spaces) {
      const storachaSpaces = spaces.map((space) => ({
        value: space.did(),
        group: account?.toEmail(),
        label: `${space.name} (${shortenDID(space.did())})`,
      }))
      result.push(...storachaSpaces)
    }

    result.push({
      label: 'Create new space',
      value: CREATE_NEW_STORACHA_SPACE_VALUE,
    })

    return result
  }, [spaces, account, props.disabled, props.value])

  const handleChange = (value: string) => {
    if (value === CREATE_NEW_STORACHA_SPACE_VALUE) {
      onOpen()
      return
    }

    if (props.onChange && value !== CREATE_NEW_STORACHA_SPACE_VALUE) {
      props.onChange(value)
      setSelectedValue(value)
    }
  }

  const handleSpaceCreated = (newSpaceId: string) => {
    if (props.onChange) {
      props.onChange(newSpaceId)
      setSelectedValue(newSpaceId)
    }
    onClose()
  }

  const StorachaControl = (props: ControlProps<Option>) => {
    const selectedOption = props.getValue()[0]
    const hasValue = Boolean(selectedOption?.value || options?.[0]?.label)
    return (
      <components.Control {...props}>
        <Box
          $gap="1rem"
          $display="flex"
          $justifyContent="space-between"
          $background={hasValue ? 'var(--color-white)' : ''}
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
          <Stack $justifyContent="space-between" $direction="row" $width="85%">
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
    <>
      <SelectField
        name={props.name}
        options={options || []}
        value={selectedValue}
        onChange={handleChange}
        disabled={props.disabled}
        defaultValue={options?.[0]?.value}
        components={{
          Control: StorachaControl,
          ValueContainer: StorachaSpaceContainer,
        }}
      />

      <CreateSpaceModal
        isOpen={isOpen}
        onClose={onClose}
        // @ts-expect-error i don't want to set the prop type in the modal as `Storacha.Account | undefined`
        account={account as Storacha.Account}
        onSpaceCreated={handleSpaceCreated}
      />
    </>
  )
}
