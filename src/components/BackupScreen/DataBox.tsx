import { styled } from 'next-yak'
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

const Label = styled.label`
  display: contents;
`

export const DataBox = ({
  label,
  description,
  width = '48%',
  ...switchProps
}: DataBoxProps) => {
  const id = useId()
  const switchRef = useRef<HTMLInputElement>(null)
  return (
    <Label>
      <Box
        $padding="8px"
        $display="flex"
        $justifyContent="space-between"
        $background="var(--color-white)"
        $borderStyle="solid"
        $width={width}
        data-testid="data-box"
      >
        <Stack>
          <Text id={id} $color="var(--color-black)" $textTransform="capitalize">
            {label}
          </Text>
          <Text>{description}</Text>
        </Stack>
        <Switch aria-labelledby={id} ref={switchRef} {...switchProps} />
      </Box>
    </Label>
  )
}
