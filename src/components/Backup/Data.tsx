import { Stack, Text } from '../ui'
import { Switch } from '../Switch'
import { Box } from './Backup'

interface DataBoxProps {
  title: string
  description: string
  value: boolean
  onToggle: () => void
  width?: string
}

export const DataBox = ({
  title,
  description,
  value,
  onToggle,
  width = '48%',
}: DataBoxProps) => {
  return (
    <Box $background="var(--color-white)" $borderStyle="solid" $width={width}>
      <Stack>
        <Text $color="var(--color-black)" $textTransform="capitalize">
          {title}
        </Text>
        <Text>{description}</Text>
      </Stack>
      <Switch value={value} onClick={onToggle} />
    </Box>
  )
}
