import { ChangeEvent, useState } from 'react'
import {
  InputField,
  Modal,
  ModalProps,
  Stack,
  StatefulButton,
  Text,
} from '../ui'
import { SharedModalLayout } from './layout'
import { Box } from '../Backup/Backup'
import { useW3 } from '@w3ui/react'
import * as StorachaSpace from '@web3-storage/w3up-client/space'
import * as Storacha from '@web3-storage/w3up-client/account'
import { toast } from 'sonner'
import { shorten } from '@/lib/ui'
import { CheckCircle, Copy } from '@phosphor-icons/react'

type SpaceCreationState = 'idle' | 'creating-space' | 'creating-delegation'

interface CreateSpaceModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  account: Storacha.Account
}

export const CreateSpaceModal = ({
  isOpen,
  onClose,
  account,
}: CreateSpaceModalProps) => {
  const [state, setState] = useState<SpaceCreationState>('idle')
  const [spaceName, setSpaceName] = useState<string>('')
  const [spaceCreationStep, setSpaceCreationStep] = useState<
    'space-name' | 'recovery-phase'
  >('space-name')

  const [storacha] = useW3()
  const [recoveryKey, setRecoveryKey] = useState<string>('')
  const [createdSpace, setCreatedSpace] =
    useState<StorachaSpace.OwnedSpace | null>(null)
  const [hasCopiedKey, setHasCopiedKey] = useState<boolean>(false)

  const createSpace = async () => {
    try {
      setState('creating-space')
      const space = await storacha.client?.createSpace(spaceName, { account })
      if (!space) throw new Error('Failed to create space')

      const key = StorachaSpace.toMnemonic(space)
      setRecoveryKey(key)
      setCreatedSpace(space)
      setSpaceCreationStep('recovery-phase')
      toast.success(`${shorten(spaceName)} created!`)
    } catch (error) {
      console.error(error)
      toast.error(`Error ${(error as Error).message}`)
    } finally {
      setState('idle')
    }
  }

  const createDelegationForSpace = async () => {
    if (!createdSpace) return

    try {
      setState('creating-delegation')
      const recovery = await createdSpace.createRecovery(account.did())
      await storacha.client?.capability.access.delegate({
        space: createdSpace.did(),
        delegations: [recovery],
      })
    } catch (error) {
      console.error(error)
      toast.error(`Error ${(error as Error).message}`)
    } finally {
      setState('idle')
    }
  }

  const copyRecoveryKey = async () => {
    if (!recoveryKey) return

    try {
      await navigator.clipboard.writeText(recoveryKey)
      setHasCopiedKey(true)
    } catch (error) {
      console.error(error)
      toast.error(`Error ${(error as Error).message}`)
    }
  }

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      background="var(--color-light-blue-100)"
    >
      <SharedModalLayout title="Create a new space" onClose={onClose}>
        <Box
          $width="62%"
          $height="100%"
          $padding="0.8rem 1rem"
          $borderStyle="solid"
          $background="var(--color-white)"
        >
          {spaceCreationStep === 'space-name' ? (
            <Stack $gap="1.2rem" $width="100%">
              <Text>Please give your space a name.</Text>
              <Stack $gap="1rem">
                <InputField
                  type="text"
                  value={spaceName}
                  placeholder="HOT Saucer!"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSpaceName(e.target.value)
                  }
                />
                <StatefulButton
                  onClick={createSpace}
                  $fontSize="0.75rem"
                  $height="fit-content"
                  isLoading={state === 'creating-space'}
                  disabled={state === 'creating-space'}
                  $background="var(--color-dark-blue)"
                >
                  Create space
                </StatefulButton>
              </Stack>
            </Stack>
          ) : (
            <Stack $gap="1.2rem" $width="100%">
              <Text>
                You need to save the following secret recovery key somewhere
                safe! For example write it down on a piece of papaer and put it
                inside your favorite book.
              </Text>
              <Stack $gap="1rem">
                <Box $position="relative">
                  <Text>{recoveryKey}</Text>
                  <Box
                    $position="absolute"
                    $top="1px"
                    $right="2px"
                    $border="none"
                  >
                    {hasCopiedKey ? (
                      <CheckCircle weight="fill" size="18" color="lightgreen" />
                    ) : (
                      <Copy
                        color="var(--color-gray-light)"
                        size="18"
                        onClick={copyRecoveryKey}
                      />
                    )}
                  </Box>
                </Box>
                <StatefulButton
                  $height="fit-content"
                  $fontSize="0.75rem"
                  $background="var(--color-dark-blue)"
                  onClick={createDelegationForSpace}
                  isLoading={state === 'creating-delegation'}
                  disabled={state === 'creating-delegation'}
                >
                  {state === 'creating-delegation'
                    ? 'Securing recovery...'
                    : 'Create delegation'}
                </StatefulButton>
              </Stack>
            </Stack>
          )}
        </Box>
      </SharedModalLayout>
    </Modal>
  )
}
