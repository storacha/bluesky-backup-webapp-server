import { useId } from 'react'

import { Box, Stack, Text } from '../ui'

import { Switch } from './Switch'

interface DataBoxProps {
  title: string
  name: string
  description: string
  value: boolean
  onToggle?: () => void
  width?: string
}

export const DataBox = ({
  title,
  name,
  description,
  value,
  onToggle,
  width = '48%',
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
            {title}
          </Text>
        </label>
        <Text>{description}</Text>
      </Stack>
      <Switch id={id} name={name} isSelected={value} onChange={onToggle} />
    </Box>
  )
}
