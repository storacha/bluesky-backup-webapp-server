import { Switch } from '../Switch'
import { Stack, Text } from '../ui'

import { Box } from './BackupDetail'
import { useId } from 'react'

interface DataBoxProps {
  title: string
  name: string
  description: string
  value: boolean
  onToggle: () => void
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
      <Switch
        id={id}
        name={name}
        value={value}
        onClick={onToggle}
        aria-label={title}
      />
    </Box>
  )
}
