import { useId } from 'react'

import { Box, Stack, Text } from '../ui'

import { Switch, SwitchProps } from './Switch'

interface DataBoxProps extends SwitchProps {
  label: string
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
  return (
    <Box
      $padding="8px"
      $display="flex"
      $justifyContent="space-between"
      $background="var(--color-white)"
      $borderStyle="solid"
      $width={width}
    >
      <Stack>
        <label htmlFor={id}>
          <Text $color="var(--color-black)" $textTransform="capitalize">
            {label}
          </Text>
        </label>
        <Text>{description}</Text>
      </Stack>
      <Switch id={id} {...switchProps} />
    </Box>
  )
}
