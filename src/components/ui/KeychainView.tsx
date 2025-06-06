'use client'

import { Agent, CredentialSession, Did } from '@atproto/api'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
  ArrowCircleRightIcon,
  GearIcon,
  IdentificationBadgeIcon,
  TrashIcon,
  //  Trash,
} from '@phosphor-icons/react'
import { styled } from 'next-yak'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { mutate } from 'swr'

import { KeychainContextProps } from '@/contexts/keychain'
import { useProfile } from '@/hooks/use-profile'
import { ATPROTO_DEFAULT_SOURCE } from '@/lib/constants'
import { shortenDID } from '@/lib/ui'
import { ProfileData, RotationKey } from '@/types'

import CopyButton from '../CopyButton'
import { Loader } from '../Loader'

import {
  Button,
  Heading,
  InputField,
  Modal,
  roundRectStyle,
  Spinner,
  Stack,
  Text,
} from '.'

import { LoginFn, PlcTokenForm } from './atproto'
import { CreateButton } from './CreateButton'
import NewKey from './NewKey'
import RotationKeyStatus from './RotationKeyStatus'

export function isCurrentRotationKey(
  rotationKey: RotationKey,
  profile: ProfileData
): boolean {
  return profile.rotationKeys.includes(rotationKey.id)
}

interface AtprotoLoginFormProps {
  login: LoginFn
  server: string
  handle: string
}

export interface PwForm {
  password: string
}

const LoginFormElement = styled.form`
  width: 384px;
`

function AtprotoLoginForm({ login, handle, server }: AtprotoLoginFormProps) {
  const { register, handleSubmit, reset } = useForm<PwForm>()
  const onSubmit = handleSubmit(async (data) => {
    await login(handle, data.password, { server })
    reset()
  })
  return (
    <LoginFormElement onSubmit={onSubmit}>
      <Stack $gap="1rem">
        <InputField
          label="Password"
          type="password"
          autoComplete="off"
          {...register('password')}
        />
        <Button type="submit">Log In</Button>
      </Stack>
    </LoginFormElement>
  )
}

const PlcOpCode = styled.code`
  font-size: 0.5em;
`

export function AddRotationKey({
  atprotoAccount,
  rotationKey,
  onDone,
}: {
  atprotoAccount: Did
  rotationKey: RotationKey
  onDone: () => void
}) {
  const { data: profile } = useProfile(atprotoAccount)
  const {
    handle,
    rotationKeys: existingKeys,
    alsoKnownAs,
    services,
    verificationMethods,
  } = profile || {}
  const [sourceAgent, setSourceAgent] = useState<Agent>()
  const [plcOp, setPlcOp] = useState<Record<string, unknown>>()
  const [isTransferringIdentity, setIsTransferringIdentity] =
    useState<boolean>(false)
  const [
    isPlcRestoreAuthorizationEmailSent,
    setIsPlcRestoreAuthorizationEmailSent,
  ] = useState<boolean>(false)

  async function sendPlcRestoreAuthorizationEmail() {
    if (sourceAgent) {
      await sourceAgent.com.atproto.identity.requestPlcOperationSignature()
      setIsPlcRestoreAuthorizationEmailSent(true)
    } else {
      console.warn(
        'could not send PLC operation authorization, sourceAgent is not truthy'
      )
    }
  }
  const loginToSource: LoginFn = async (
    identifier: string,
    password: string,
    { server = ATPROTO_DEFAULT_SOURCE } = { server: ATPROTO_DEFAULT_SOURCE }
  ) => {
    const session = new CredentialSession(new URL(server))
    await session.login({ identifier, password })
    const agent = new Agent(session)
    setSourceAgent(agent)
  }
  async function setupPlcRestore(plcToken: string) {
    if (sourceAgent) {
      if (!existingKeys) {
        throw new Error('No rotation key provided')
      }
      const plcOpResponse =
        await sourceAgent.com.atproto.identity.signPlcOperation({
          token: plcToken,
          rotationKeys: [...existingKeys, rotationKey.id],
          alsoKnownAs,
          services,
          verificationMethods,
        })
      setPlcOp(plcOpResponse.data.operation)
    } else {
      console.warn('could not create plcOp:', sourceAgent, plcToken)
    }
  }
  const isPlcRestoreSetup = !!plcOp

  async function transferIdentity() {
    if (sourceAgent && plcOp) {
      setIsTransferringIdentity(true)
      await sourceAgent.com.atproto.identity.submitPlcOperation({
        operation: plcOp,
      })
      setIsTransferringIdentity(false)
      onDone()
      mutate(['api', `/api/profile?did=${atprotoAccount}`])
    } else {
      console.warn('not transferring identity: ', sourceAgent, plcOp)
    }
  }
  const server = services?.atproto_pds?.endpoint
  return (
    <Stack $gap="1rem">
      {sourceAgent ? (
        isPlcRestoreAuthorizationEmailSent ? (
          isPlcRestoreSetup ? (
            <Stack $gap="1rem">
              <Text>
                You&apos;re ready to add your recovery key! Your PLC data will
                look like:
              </Text>
              <PlcOpCode>
                <pre>{JSON.stringify(plcOp, null, 4)}</pre>
              </PlcOpCode>
              <Button
                onClick={transferIdentity}
                disabled={isTransferringIdentity}
                $leftIcon={
                  <ArrowCircleRightIcon
                    size="16"
                    color="var(--color-gray-medium)"
                  />
                }
              >
                Add my recovery key
              </Button>
              <Popover>
                <PopoverButton></PopoverButton>
                <PopoverPanel static anchor="bottom"></PopoverPanel>
              </Popover>
            </Stack>
          ) : (
            <PlcTokenForm setPlcToken={setupPlcRestore} />
          )
        ) : (
          <Stack $gap="1rem">
            <Text>
              To register your new recovery key you must provide a confirmation
              code sent to the`` email registered with your current PDS host.
            </Text>
            <Button
              onClick={sendPlcRestoreAuthorizationEmail}
              disabled={isTransferringIdentity}
              $variant="primary"
            >
              Send Email
            </Button>
          </Stack>
        )
      ) : (
        <Stack $gap="1rem">
          <Stack $gap="1rem">
            <Heading>Data Restore and Identity Transfer</Heading>
            <Text>
              Log in to {server} as {handle}.
            </Text>
            <Text>
              Your password won&apos;t be stored - when you reload the page
              you&apos;ll be logged back out of {server}.
            </Text>
          </Stack>
          {handle && server ? (
            <AtprotoLoginForm
              login={loginToSource}
              handle={handle}
              server={server}
            />
          ) : (
            <Spinner />
          )}
        </Stack>
      )}
    </Stack>
  )
}

export const RotationKeyStack = styled(Stack)`
  margin-top: 1rem;
`

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
        title="Recovery Key Status"
        size="md"
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
        size="md"
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
