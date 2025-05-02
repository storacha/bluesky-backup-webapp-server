import { ArrowLeft } from '@phosphor-icons/react'
import { ReactNode } from 'react'

import { Box, ModalProps, Stack, Text } from '../ui'

interface SharedModalLayoutProps extends Pick<ModalProps, 'onClose'> {
  title: string
  children: ReactNode
}

export const SharedModalLayout = ({
  children,
  title,
  onClose,
}: SharedModalLayoutProps) => {
  return (
    <Stack $direction="row" $gap="3rem">
      <Stack $gap="1rem" $width="30%">
        <Box
          $width="40px"
          $height="40px"
          $borderStyle="solid"
          $display="flex"
          onClick={onClose}
        >
          <ArrowLeft color="var(--color-black)" size="20" />
        </Box>
        <Text
          $fontWeight="700"
          $fontSize="1.125rem"
          $color="var(--color-black)"
        >
          {title}
        </Text>
      </Stack>
      {children}
    </Stack>
  )
}
