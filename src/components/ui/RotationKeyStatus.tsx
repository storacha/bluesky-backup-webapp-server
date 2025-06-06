'use client'
import { Did } from '@atproto/api'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { shortenDID } from '@/lib/ui'
import { ProfileData, RotationKey } from '@/types'

import { Button } from './Button'
import { IdentityTransfer } from './IdentityTransfer'
import {
  AddRotationKey,
  isCurrentRotationKey,
  RotationKeyStack,
} from './KeychainView'
import KeyImportForm from './KeyImportForm'
import { Stack } from './Stack'
import { NoTextTransform } from './style'
import { Heading, Text } from './text'

import type { KeyHydrateFn } from '@/contexts/keychain'

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
  const isSignable = Boolean(rotationKey.keypair)
  const [isAddingKey, setIsAddingKey] = useState(false)
  const [isTransferringIdentity, setIsTransferringIdentity] = useState(false)
  if (!profile) return null
  return isAddingKey ? (
    <AddRotationKey atprotoAccount={profile.did} rotationKey={rotationKey} onDone={onDone} />
  ) : isTransferringIdentity ? (
    <IdentityTransfer profile={profile} rotationKey={rotationKey} />
  ) : (
    <RotationKeyStack $gap="2rem">
      <Stack $gap="2rem">
        <Heading>
          <NoTextTransform>{shortenDID(rotationKey.id)}</NoTextTransform>
        </Heading>
        <Stack $gap="1rem">
          <Text $fontSize="1rem" $color="var(--color-black)">
            {isSignable ? <>Does</> : <>Does not</>} have a private key loaded.
          </Text>
          {!isSignable && (
            <KeyImportForm dbKey={rotationKey} importKey={hydrateKey} />
          )}
        </Stack>
        <Stack $gap="1rem">
          <Text $fontSize="1rem" $color="var(--color-black)">
            {isRotationKey ? <>Is</> : <>Is not</>} currently a recovery key.
          </Text>
          {!isRotationKey && (
            <Button
              onClick={() => {
                setIsAddingKey(true)
              }}
            >
              Add This Key To {handle}
            </Button>
          )}
        </Stack>
      </Stack>
      <Stack $direction="row" $gap="1rem">
        {isRotationKey && isSignable && (
          <Button
            disabled={!params.get('identity-transfer')}
            onClick={() => {
              setIsTransferringIdentity(true)
            }}
          >
            Transfer Identity (coming soon!)
          </Button>
        )}

        <Button onClick={onDone}>Done</Button>
      </Stack>
    </RotationKeyStack>
  )
}
