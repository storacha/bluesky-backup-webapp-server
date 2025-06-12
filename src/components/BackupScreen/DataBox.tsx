import { styled } from 'next-yak'
import { Ref, useId } from 'react'

import { Box, Stack, Text } from '../ui'

import { Switch, SwitchProps } from './Switch'

interface DataBoxProps extends SwitchProps {
  /** The main label text for the box. */
  label: string
  /** A slightly longer description */
  description: string
  width?: string
  /** A ref which will attach to the switch's input element. */
  switchRef?: Ref<HTMLInputElement>
}

const Label = styled.label`
  display: contents;
  & > * {
    flex: 1;
  }
`

export const DataBox = ({
  label,
  description,
  width = '48%',
  switchRef,
  ...switchProps
}: DataBoxProps) => {
  const id = useId()
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
