'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { isCurrentRotationKey } from '@/lib/domain'
import { shortenDID } from '@/lib/ui'
import { ProfileData, RotationKey } from '@/types'

import AddRotationKey from './AddRotationKey'
import { Button } from './Button'
import { IdentityTransfer } from './IdentityTransfer'
import { ModalLeft, ModalRight, ModalStack } from './modal'
import { Stack } from './Stack'
import { Heading, SubHeading, Text } from './text'

import type { KeyHydrateFn } from '@/contexts/keychain'
import KeyImportForm from './KeyImportForm'

export default function RotationKeyStatus ({
  rotationKey,
  profile,
  hydrateKey,
  onDone,
}: {
  rotationKey: RotationKey
  profile?: ProfileData
  hydrateKey: KeyHydrateFn
  onDone: () => void
}) {
  const { handle } = profile || {}
  const params = useSearchParams()
  const isRotationKey = profile && isCurrentRotationKey(rotationKey, profile)
  const [isAddingKey, setIsAddingKey] = useState(false)
  const [isTransferringIdentity, setIsTransferringIdentity] = useState(false)
  const breakpoints = useMobileScreens()
  if (!profile) return null
  return isAddingKey ? (
    <AddRotationKey
      profile={profile}
      rotationKey={rotationKey}
      onDone={onDone}
    />
  ) : isTransferringIdentity ? (
    rotationKey.keypair ? (
      <IdentityTransfer profile={profile} rotationKey={rotationKey} />
    ) : (
      <KeyImportForm rotationKey={rotationKey} importKey={hydrateKey} />
    )
  ) : (
    <ModalStack {...breakpoints}>
      <ModalLeft {...breakpoints}>
        <Heading>Rotation Key</Heading>
        <SubHeading>{shortenDID(rotationKey.id)}</SubHeading>
        <SubHeading>{handle}</SubHeading>
      </ModalLeft>
      <ModalRight $justifyContent="space-between" $gap="2em" {...breakpoints}>
        <Text $fontSize="1reem">
          This key {isRotationKey ? 'is' : 'is not'} installed as a recovery key
          for&nbsp;{handle}.
        </Text>
        <Stack $direction="row" $gap="1rem" $justifyContent="space-between">
          {isRotationKey ? (
            <Button
              $fontSize="1rem"
              disabled={!params.get('identity-transfer')}
              onClick={() => {
                setIsTransferringIdentity(true)
              }}
            >
              Transfer Identity
              <Text>(coming soon!)</Text>
            </Button>
          ) : (
            <Button
              $fontSize="1rem"
              onClick={() => {
                setIsAddingKey(true)
              }}
            >
              Install Key
            </Button>
          )}
          <Button onClick={onDone}>Done</Button>
        </Stack>
      </ModalRight>
    </ModalStack>
  )
}
