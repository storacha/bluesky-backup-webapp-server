import { At } from '@phosphor-icons/react'
import { Box } from '../BackupScreen/BackupDetail'
import { Button, InputField, Modal, ModalProps, Stack, Text } from '../ui'
import { ChangeEvent, useState } from 'react'
import { SharedModalLayout } from './layout'

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
      <SharedModalLayout title="Add Bluesky account" onClose={onClose}>
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
      </SharedModalLayout>
    </Modal>
  )
}
