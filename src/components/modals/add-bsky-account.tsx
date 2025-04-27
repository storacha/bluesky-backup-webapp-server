import { ArrowLeft, At } from '@phosphor-icons/react'
import { Box } from '../Backup/Backup'
import { Button, InputField, Modal, ModalProps, Stack, Text } from '../ui'
import { ChangeEvent, useState } from 'react'

export const AddBskyAccountModal = ({
  isOpen,
  onClose,
}: Pick<ModalProps, 'isOpen' | 'onClose'>) => {
  const [email, setEmail] = useState<string>('')

  const handleEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      background="var(--color-light-blue-100)"
    >
      <Stack $direction="row" $gap="3rem">
        <Stack $gap="1rem" $width="30%">
          <Box
            $display="flex"
            $borderStyle="solid"
            $height="40px"
            $width="40px"
            onClick={onClose}
          >
            <ArrowLeft color="var(--color-black)" size="20" />
          </Box>
          <Text
            $fontSize="1.125rem"
            $fontWeight="700"
            $color="var(--color-black)"
          >
            Add Bluesky account
          </Text>
        </Stack>
        <Box
          $width="62%"
          $borderStyle="solid"
          $background="var(--color-white)"
          $padding="0.8rem 1rem"
          $height="100%"
        >
          <Stack $gap="1.2rem" $width="100%">
            <Stack>
              <Text
                $color="var(--color-black)"
                $fontWeight="700"
                $fontSize="0.875rem"
              >
                Login
              </Text>
              <Text>
                To get started, please log in to your Bluesky account.
              </Text>
            </Stack>
            <Stack $gap="1rem">
              <InputField
                type="email"
                value={email}
                onChange={(e) => handleEmail(e)}
                placeholder="timothy-chalamet"
                icon={<At size="16" color="var(--color-gray-medium)" />}
              />
              <Button
                $background="var(--color-dark-blue)"
                $height="fit-contnt"
                $fontSize="0.75rem"
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Modal>
  )
}
