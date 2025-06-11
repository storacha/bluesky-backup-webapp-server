'use client'

import {
  GearIcon,
  IdentificationBadgeIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { styled } from 'next-yak'
import { useState } from 'react'

import { KeychainContextProps } from '@/contexts/keychain'
import { isCurrentRotationKey } from '@/lib/domain'
import { shortenDID } from '@/lib/ui'
import { ProfileData, RotationKey } from '@/types'

import CopyButton from '../CopyButton'
import { Loader } from '../Loader'

import { Button, Heading, Modal, roundRectStyle, Spinner, Stack, Text } from '.'

import { CreateButton } from './CreateButton'
import NewKey from './NewKey'
import RotationKeyStatus from './RotationKeyStatus'

type KeychainProps = KeychainContextProps & {
  className?: string
  profile?: ProfileData
}

const KeyItem = styled(Stack)`
  ${roundRectStyle}
  background: var(--color-white);
  border: 1px solid var(--color-gray-medium);
  padding: 1rem;
`

const PublicKey = styled.div`
  font-style: bold;
`

export default function KeychainView({
  keys,
  generateKeyPair,
  hydrateKey,
  importKey,
  forgetKey,
  profile,
}: KeychainProps) {
  const { did: atprotoAccount, rotationKeys, handle } = profile ?? {}
  const [generatingKeyPair, setGeneratingKeyPair] = useState(false)
  const [newKey, setNewKey] = useState<RotationKey>()
  const [isRotationKeyDialogOpen, setIsRotationKeyDialogOpen] = useState(false)

  const [selectedKeyDetails, setSelectedKeyDetails] =
    useState<RotationKey | null>(null)

  async function onClickAdd() {
    if (!generateKeyPair)
      throw new Error(
        'could not generate key pair, generator function is not defined'
      )
    if (!atprotoAccount)
      throw new Error(
        'could not generate key pair, atprotoAccount is not defined'
      )

    setGeneratingKeyPair(true)
    setNewKey(await generateKeyPair(atprotoAccount))
    setGeneratingKeyPair(false)
  }

  const openRotationKeyStatus = (key: RotationKey) => {
    setSelectedKeyDetails(key)
    setIsRotationKeyDialogOpen(true)
  }

  const myKeys = keys.filter((key) => key.atprotoAccount === atprotoAccount)

  return (
    <Stack $gap="1rem">
      <Heading>Recovery Keys</Heading>

      {generatingKeyPair ? (
        <Stack>
          <Spinner />
          <Text>Generating key...</Text>
        </Stack>
      ) : (
        <>
          {!profile ? (
            <Loader />
          ) : myKeys.length === 0 ? (
            <Text>No recovery keys found for {handle}</Text>
          ) : (
            <Stack $gap="1em">
              {myKeys.map((key) => (
                <KeyItem
                  key={key.id}
                  $direction="row"
                  $alignItems="center"
                  $justifyContent="space-between"
                >
                  <Stack
                    $direction="row"
                    $justifyContent="space-between"
                    $width="12em"
                  >
                    <PublicKey>{shortenDID(key.id)}</PublicKey>
                    <CopyButton text={key.id} />
                  </Stack>
                  <Stack $direction="row" $gap="0.5rem">
                    <Button
                      $variant="outline"
                      className="p-1"
                      onClick={() => openRotationKeyStatus(key)}
                      aria-label="Rotation key status"
                    >
                      <IdentificationBadgeIcon
                        size="16"
                        color={
                          rotationKeys
                            ? isCurrentRotationKey(key, profile)
                              ? 'var(--color-green)'
                              : 'var(--color-dark-red)'
                            : 'var(--color-gray-medium)'
                        }
                      />
                    </Button>

                    <Button
                      $variant="outline"
                      className="p-1"
                      onClick={() => openRotationKeyStatus(key)}
                      aria-label="View key details"
                    >
                      <GearIcon size="16" color="var(--color-gray-medium)" />
                    </Button>
                    <Button
                      $variant="outline"
                      className="p-1"
                      onClick={() => forgetKey(key)}
                      aria-label="View key details"
                    >
                      <TrashIcon size="16" color="var(--color-gray-medium)" />
                    </Button>
                  </Stack>
                </KeyItem>
              ))}
            </Stack>
          )}
        </>
      )}
      <Stack $direction="row" $mt="1.4rem" $gap="1rem">
        <CreateButton onClick={onClickAdd} disabled={generatingKeyPair}>
          New Key
        </CreateButton>
        <CreateButton
          onClick={() => atprotoAccount && importKey(atprotoAccount)}
        >
          Import Key
        </CreateButton>
      </Stack>
      <Modal
        isOpen={isRotationKeyDialogOpen}
        onClose={() => setIsRotationKeyDialogOpen(false)}
        size="lg"
        background="var(--color-light-blue-100)"
      >
        {selectedKeyDetails && atprotoAccount && isRotationKeyDialogOpen && (
          <RotationKeyStatus
            profile={profile}
            rotationKey={selectedKeyDetails}
            hydrateKey={hydrateKey}
            onDone={() => setIsRotationKeyDialogOpen(false)}
          />
        )}
      </Modal>
      <Modal
        isOpen={Boolean(newKey)}
        onClose={() => {
          setNewKey(undefined)
        }}
        size="lg"
        background="var(--color-light-blue-100)"
      >
        {newKey && (
          <NewKey
            rotationKey={newKey}
            onDone={() => {
              setNewKey(undefined)
            }}
          />
        )}
      </Modal>
    </Stack>
  )
}
