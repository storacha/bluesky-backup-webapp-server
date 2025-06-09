'use client'

import { Secp256k1Keypair } from '@atproto/crypto'
import { base64pad } from 'multiformats/bases/base64'
import { styled } from 'next-yak'
import { useState } from 'react'
import { toast } from 'sonner'

import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { shortenDID } from '@/lib/ui'
import { RotationKey } from '@/types'

import CopyButton from '../CopyButton'

import {
  Button,
  Heading,
  ModalLeft,
  ModalRight,
  ModalStack,
  Span,
  Stack,
  Text,
} from '.'

const SecretText = styled(Text)`
  font-family: var(--font-dm-mono);
  font-size: 1em;
`

const SecretBox = styled(Text)`
  border-radius: 12px;
  border: 1px solid var(--color-gray-light);
  padding: 1em;
`

async function exportSecret(keypair: Secp256k1Keypair) {
  return base64pad.encode(await keypair.export())
}

interface KeyDetailsProps {
  rotationKey: RotationKey
  onDone?: () => unknown
}

export default function NewKey({ rotationKey, onDone }: KeyDetailsProps) {
  const [secret, setSecret] = useState<string>()
  const keypair = rotationKey.keypair
  const did = rotationKey.id

  async function showSecret() {
    if (keypair) {
      setSecret(await exportSecret(keypair))
    } else {
      console.warn("can't show secret, keypair is falsy")
    }
  }

  function hideSecret() {
    setSecret(undefined)
  }

  async function copySecret() {
    if (!keypair) throw new Error('secret not defined')
    navigator.clipboard.writeText(await exportSecret(keypair))
    toast.success(`Copied private key for ${did} to the clipboard.`)
  }
  const breakpoints = useMobileScreens()

  return (
    <ModalStack {...breakpoints}>
      <ModalLeft {...breakpoints}>
        <Heading>We created your key</Heading>
        <Text>
          Make sure to{' '}
          <Span $fontWeight="700" $color="var(--color-black)">
            {' '}
            copy the secret immediately{' '}
          </Span>
          . If you lose it, you won&apos;t be able to access your backup.
        </Text>
      </ModalLeft>
      <ModalRight {...breakpoints} $gap="2rem">
        <Stack>
          <Text $color="var(--color-black)" $fontSize="1rem">
            New Rotation Key
          </Text>
          <Stack $direction="row" $alignItems="center" $gap="0.5rem">
            <Text>{shortenDID(did)}</Text>
            <CopyButton text={did} />
          </Stack>
        </Stack>
        {secret && (
          <SecretBox>
            <Stack $direction="row" $gap="0.5rem" $alignItems="center">
              <SecretText>{secret}</SecretText>
              <CopyButton text={secret} />
            </Stack>
          </SecretBox>
        )}
        <Stack $direction="row" $gap="0.5rem">
          {secret ? (
            <Button $variant="secondary" onClick={hideSecret}>
              Hide&nbsp;Secret
            </Button>
          ) : (
            <>
              <Button
                $variant="secondary"
                $fontSize="1rem"
                onClick={showSecret}
              >
                Show&nbsp;Secret
              </Button>
              <Button
                $variant="secondary"
                $fontSize="1rem"
                onClick={copySecret}
              >
                Copy&nbsp;Secret
              </Button>
            </>
          )}
        </Stack>
        {onDone && (
          <Button $variant="secondary" $fontSize="1rem" onClick={onDone}>
            Done
          </Button>
        )}
      </ModalRight>
    </ModalStack>
  )
}
