import { CheckCircle, Copy } from '@phosphor-icons/react'
import * as Client from '@storacha/client'
import * as Storacha from '@storacha/client/account'
import * as StorachaSpace from '@storacha/client/space'
import { ContentServeService, useAuthenticator } from '@storacha/ui-react'
import * as UcantoClient from '@ucanto/client'
import { HTTP } from '@ucanto/transport'
import * as CAR from '@ucanto/transport/car'
import { ChangeEvent, useState } from 'react'
import { toast } from 'sonner'

import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { GATEWAY_HOSTNAME, GATEWAY_ID } from '@/lib/constants'
import { shorten } from '@/lib/ui'

import {
  Box,
  InputField,
  Modal,
  ModalProps,
  Stack,
  StatefulButton,
  Text,
} from '../ui'

import { SharedModalLayout } from './layout'

const toWebDID = (input?: string) =>
  UcantoClient.Schema.DID.match({ method: 'web' }).from(input)

type SpaceCreationState = 'idle' | 'creating-space' | 'creating-delegation'

interface CreateSpaceModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  account: Storacha.Account
  onSpaceCreated?: (spaceId: string) => void
}

export const CreateSpaceModal = ({
  isOpen,
  onClose,
  account,
  onSpaceCreated,
}: CreateSpaceModalProps) => {
  const { isMobile } = useMobileScreens()
  const [state, setState] = useState<SpaceCreationState>('idle')
  const [spaceName, setSpaceName] = useState<string>('')
  const [spaceCreationStep, setSpaceCreationStep] = useState<
    'space-name' | 'recovery-phase'
  >('space-name')
  const [recoveryKey, setRecoveryKey] = useState<string>('')
  const [createdSpace, setCreatedSpace] =
    useState<StorachaSpace.OwnedSpace | null>(null)
  const [hasCopiedKey, setHasCopiedKey] = useState<boolean>(false)
  const [{ client }] = useAuthenticator()

  const createSpace = async () => {
    if (client) {
      try {
        setState('creating-space')

        /**
         * Gateway authorization code copied from console - we should move this into a library soon.
         */
        const storachaGateway = UcantoClient.connect({
          id: {
            did: () => GATEWAY_ID,
          },
          codec: CAR.outbound,
          channel: HTTP.open<ContentServeService>({
            url: new URL(`https://${GATEWAY_HOSTNAME}`),
          }),
        })

        const space = await client.createSpace(spaceName, {
          authorizeGatewayServices: [storachaGateway],
        })
        const provider = toWebDID(process.env.NEXT_PUBLIC_STORACHA_PROVIDER)
        const provisionResult = await account.provision(space.did(), {
          provider,
        })
        if (provisionResult.error)
          throw new Error(provisionResult.error.message, {
            cause: provisionResult.error,
          })

        if (space) {
          const key = StorachaSpace.toMnemonic(space)
          setRecoveryKey(key)
          setCreatedSpace(space)
          setSpaceCreationStep('recovery-phase')
          toast.success(`${shorten(spaceName)} created!`)
        }
      } catch (error) {
        console.error(error)
        toast.error(`Error ${(error as Error).message}`)
      } finally {
        setState('idle')
      }
    } else {
      console.error('client is not defined, cannot create space')
    }
  }

  const createDelegationForSpace = async () => {
    if (!createdSpace) return
    const client = await Client.create()

    try {
      setState('creating-delegation')
      const recovery = await createdSpace.createRecovery(account.did())
      await client.capability.access.delegate({
        space: createdSpace.did(),
        delegations: [recovery],
      })

      if (onSpaceCreated) {
        onSpaceCreated(createdSpace.did())
        toast.success('Recovery delegation successful!')
      }
      setSpaceCreationStep('space-name')
      onClose()
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

  const handleClose = () => {
    setSpaceName('')
    setSpaceCreationStep('space-name')
    setRecoveryKey('')
    setCreatedSpace(null)
    setHasCopiedKey(false)
    setState('idle')

    onClose()
  }

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={handleClose}
      background="var(--color-light-blue-100)"
    >
      <SharedModalLayout
        title={
          spaceCreationStep === 'space-name' ? 'Create a new space' : 'Recovery'
        }
        onClose={handleClose}
      >
        <Box
          $width={isMobile ? '100%' : '62%'}
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
                safe! For example write it down on a piece of paper and put it
                inside your favorite book.
              </Text>
              <Stack $gap="1rem">
                <Box $position="relative">
                  <Text $fontWeight="500" $color="var(--color-black)">
                    {recoveryKey}
                  </Text>
                  <Box
                    $position="absolute"
                    $top="2px"
                    $right="2px"
                    $borderStyle="solid"
                    $width="fit-content"
                    $height="fit-content"
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
                    : 'Create delegation & Complete'}
                </StatefulButton>
              </Stack>
            </Stack>
          )}
        </Box>
      </SharedModalLayout>
    </Modal>
  )
}
