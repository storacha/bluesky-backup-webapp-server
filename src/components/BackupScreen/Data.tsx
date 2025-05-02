import { Switch } from '../Switch'
import { Box, Stack, Text } from '../ui'

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
  return (
    <Box
      $display="flex"
      $justifyContent="space-between"
      $background="var(--color-white)"
      $borderStyle="solid"
      $width={width}
    >
      <Stack>
        <Text $color="var(--color-black)" $textTransform="capitalize">
          {title}
        </Text>
        <Text>{description}</Text>
      </Stack>
      <Switch name={name} value={value} onClick={onToggle} />
    </Box>
  )
}
