import { Stack } from '@/components/ui'
import { useId } from 'react'
import { Box } from './Box'

export const LocationSelect = ({
  label,
  ...selectProps
}: {
  label: string
} & React.HTMLProps<HTMLSelectElement>) => {
  const id = useId()

  return (
    <Box>
      <Stack>
        <label htmlFor={id}>{label}</label>
        <select id={id} {...selectProps} />
      </Stack>
    </Box>
  )
}
