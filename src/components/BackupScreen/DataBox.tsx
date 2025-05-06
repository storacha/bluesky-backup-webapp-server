import { useId, useRef } from 'react'

import { Box, Stack, Text } from '../ui'

import { Switch, SwitchProps } from './Switch'

interface DataBoxProps extends SwitchProps {
  /** The main label text for the box. */
  label: string
  /** A slightly longer description */
  description: string
  width?: string
}

export const DataBox = ({
  label,
  description,
  width = '48%',
  ...switchProps
}: DataBoxProps) => {
  const id = useId()
  const switchRef = useRef<HTMLInputElement>(null)
  return (
    <Box
      $padding="8px"
      $display="flex"
      $justifyContent="space-between"
      $background="var(--color-white)"
      $borderStyle="solid"
      $width={width}
      onClick={() => {
        switchRef.current?.click()
      }}
      data-testid="data-box"
    >
      <Stack>
        <label htmlFor={id}>
          <Text $color="var(--color-black)" $textTransform="capitalize">
            {label}
          </Text>
        </label>
        <Text>{description}</Text>
      </Stack>
      <Switch id={id} ref={switchRef} {...switchProps} />
    </Box>
  )
}
