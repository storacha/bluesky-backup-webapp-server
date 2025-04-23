import { Stack } from '@/components/ui'
import { styled } from 'next-yak'
import { useId } from 'react'

const Label = styled.label`
  text-align: left;
  font-size: 0.75rem;
`

const Select = styled.select`
  text-align: left;
  font-family: var(--font-dm-mono);
  color: var(--color-gray-medium);
  font-size: 0.75rem;
`

export const LocationSelect = ({
  label,
  ...selectProps
}: {
  label: string
} & React.HTMLProps<HTMLSelectElement>) => {
  const id = useId()

  return (
    <Stack $alignItems='start'>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} {...selectProps} />
    </Stack>
  )
}
