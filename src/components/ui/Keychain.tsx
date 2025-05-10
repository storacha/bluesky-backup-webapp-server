'use client'

import { Agent, CredentialSession, Did } from '@atproto/api'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
  ArrowCircleRight,
  Eye,
  EyeSlash,
  Gear,
  IdentificationBadge,
  //  Trash,
} from '@phosphor-icons/react'
import { base64pad } from 'multiformats/bases/base64'
import { styled } from 'next-yak'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { mutate } from 'swr'

import { KeychainContextProps, useKeychainContext } from '@/contexts/keychain'
import { useProfile } from '@/hooks/use-profile'
import { ATPROTO_DEFAULT_SOURCE } from '@/lib/constants'
import { shortenDID } from '@/lib/ui'
import { RotationKey } from '@/types'

import CopyButton from '../CopyButton'
import { LoginFn, PlcTokenForm } from '../RestoreUI/RestoreDialogView'

import {
  Button,
  Heading,
  InputField,
  Modal,
  NoTextTransform,
  roundRectStyle,
  Spinner,
  Stack,
  SubHeading,
  Text,
  TextAreaField,
} from '.'

import { CreateButton } from './CreateButton'

import type { KeyImportFn } from '@/contexts/keychain'

interface KeyImportFormParams {
  keyMaterial: string
}

function KeyImportForm({
  dbKey,
  importKey,
}: {
  dbKey: RotationKey
  importKey: KeyImportFn
}) {
  const { register, handleSubmit } = useForm<KeyImportFormParams>()
  async function submit(data: KeyImportFormParams) {
    await importKey(dbKey, data.keyMaterial)
  }
  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col space-y-2">
      <TextAreaField
        rows={4}
        className="w-full whitespace-pre"
        {...register('keyMaterial')}
        placeholder="Private Key"
      />
      <Button
        type="submit"
        $variant="primary"
        className="text-xs uppercase font-bold"
      >
        Confirm
      </Button>
    </form>
  )
}

const SecretText = styled(Text)`
  font-family: var(--font-dm-mono);
`

interface KeyDetailsProps {
  dbKey?: RotationKey
  importKey?: KeyImportFn
  onDone?: () => unknown
}

function KeyDetails({ dbKey, onDone, importKey }: KeyDetailsProps) {
  const [secret, setSecret] = useState<string>()
  const [showImport, setShowImport] = useState<boolean>(false)
  const keypair = dbKey?.keypair

  async function showSecret() {
    const secret = await keypair?.export()
    if (secret) {
      setSecret(base64pad.encode(secret))
    } else {
      console.warn("can't show secret", keypair)
    }
  }

  function hideSecret() {
    setSecret(undefined)
  }

  async function importAndClose(key: RotationKey, keyMaterial: string) {
    if (importKey) {
      await importKey(key, keyMaterial)
      setShowImport(false)
    } else {
      console.warn('importKey was not defined, cannot import key')
    }
  }

  const did = dbKey?.id || keypair?.did()

  return (
    <Stack>
      {did && (
        <Stack>
          <SubHeading>
            Key <NoTextTransform>DID</NoTextTransform>
          </SubHeading>
          <Stack $direction="row" $alignItems="center" $gap="0.5rem">
            <Text>{shortenDID(did)}</Text>
            <CopyButton text={did} />
          </Stack>
        </Stack>
      )}

      {showImport && importKey && dbKey ? (
        <div className="mt-2">
          <KeyImportForm dbKey={dbKey} importKey={importAndClose} />
        </div>
      ) : secret ? (
        <Stack>
          <SubHeading>Secret Key</SubHeading>
          <SecretText>{secret}</SecretText>
          <Stack $direction="row" $gap="0.5rem">
            <Button
              $variant="secondary"
              onClick={hideSecret}
              $leftIcon={
                <EyeSlash size="16" color="var(--color-gray-medium)" />
              }
            >
              Hide
            </Button>
            <CopyButton text={secret} />
          </Stack>
        </Stack>
      ) : (
        <Stack $direction="row">
          {!keypair && (
            <Button
              $variant="secondary"
              onClick={() => {
                setShowImport(true)
              }}
            >
              Import Key
            </Button>
          )}
          {keypair && (
            <>
              <Button
                $variant="secondary"
                onClick={showSecret}
                $leftIcon={<Eye size="16" color="var(--color-gray-medium)" />}
              >
                Show Secret
              </Button>
            </>
          )}
          {onDone && (
            <Button $variant="primary" onClick={onDone}>
              Done
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  )
}

function isCurrentRotationKey(
  rotationKey: RotationKey,
  currentKeys: string[]
): boolean {
  return currentKeys.includes(rotationKey.id)
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

function AddRotationKey({
  did,
  rotationKey,
  onDone,
}: {
  did: Did
  rotationKey: RotationKey
  onDone: () => void
}) {
  const { data: profile } = useProfile(did)
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
          rotationKeys: [rotationKey.id, ...existingKeys],
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
      mutate(['api', `/api/profile?did=${did}`])
    } else {
      console.warn('not transferring identity: ', sourceAgent, plcOp)
    }
  }
  const server = services?.atproto_pds.endpoint
  return (
    <Stack $gap="1rem">
      {sourceAgent ? (
        isPlcRestoreAuthorizationEmailSent ? (
          isPlcRestoreSetup ? (
            <Stack $gap="1rem">
              <Text>
                You&apos;re ready to add your rotation key! Your PLC data will
                look like:
              </Text>
              <PlcOpCode>
                <pre>{JSON.stringify(plcOp, null, 4)}</pre>
              </PlcOpCode>
              <Button
                onClick={transferIdentity}
                disabled={isTransferringIdentity}
                $leftIcon={
                  <ArrowCircleRight
                    size="16"
                    color="var(--color-gray-medium)"
                  />
                }
              >
                Add my rotation key
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
              To transfer your identity you must provide a confirmation code
              sent to the email registered with your current PDS host.
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

const RotationKeyStack = styled(Stack)`
  margin-top: 1rem;
`

function RotationKeyStatus({
  did,
  rotationKey,
  onDone,
}: {
  did: Did
  rotationKey: RotationKey
  onDone: () => void
}) {
  const { data: profile } = useProfile(did)
  const { handle, rotationKeys: existingKeys } = profile || {}

  const isCurrentKey =
    existingKeys && isCurrentRotationKey(rotationKey, existingKeys)
  const [isAddingKey, setIsAddingKey] = useState(false)
  return isAddingKey ? (
    <AddRotationKey did={did} rotationKey={rotationKey} onDone={onDone} />
  ) : (
    <RotationKeyStack $gap="1rem">
      <Stack>
        <Heading>
          <NoTextTransform>{shortenDID(rotationKey.id)}</NoTextTransform>
        </Heading>
        <Text $fontSize="1rem">
          {isCurrentKey ? <>is</> : <>is not</>} currently a rotation key
        </Text>
      </Stack>
      {!isCurrentKey && (
        <Button
          onClick={() => {
            setIsAddingKey(true)
          }}
        >
          Add This Key To {handle}
        </Button>
      )}
      <Button onClick={onDone}>Done</Button>
    </RotationKeyStack>
  )
}

type KeychainProps = KeychainContextProps & {
  className?: string
  atprotoAccount: Did
  handle?: string
  rotationKeys?: string[]
}

const KeyItem = styled(Stack)`
  ${roundRectStyle}
  background: var(--color-white);
  border: 1px solid var(--color-gray-medium)'};
  padding: 1rem;
`

const PublicKey = styled.div`
  font-style: bold;
`

function KeychainView({
  keys,
  generateKeyPair,
  importKey,
  //forgetKey,
  atprotoAccount,
  handle,
  rotationKeys,
}: KeychainProps) {
  const [generatingKeyPair, setGeneratingKeyPair] = useState(false)
  const [newKey, setNewKey] = useState<RotationKey>()
  const [isKeyDetailsDialogOpen, setIsKeyDetailsDialogOpen] = useState(false)
  const [isRotationKeyDialogOpen, setIsRotationKeyDialogOpen] = useState(false)

  const [selectedKeyDetails, setSelectedKeyDetails] =
    useState<RotationKey | null>(null)

  async function onClickAdd() {
    if (generateKeyPair) {
      setGeneratingKeyPair(true)
      setNewKey(await generateKeyPair(atprotoAccount))
      setGeneratingKeyPair(false)
    } else {
      console.warn(
        'could not generate key pair, generator function is not defined'
      )
    }
  }

  const openRotationKeyStatus = (key: RotationKey) => {
    setSelectedKeyDetails(key)
    setIsRotationKeyDialogOpen(true)
  }

  const openKeyDetails = (key: RotationKey) => {
    setSelectedKeyDetails(key)
    setIsKeyDetailsDialogOpen(true)
  }

  const myKeys = keys.filter((key) => key.atprotoAccount === atprotoAccount)

  return (
    <Stack $gap="1rem">
      <Heading>Rotation Keys</Heading>

      {generatingKeyPair ? (
        <Stack>
          <Spinner />
          <Text>Generating key...</Text>
        </Stack>
      ) : (
        <>
          {myKeys.length === 0 ? (
            <Text>No rotation keys found for {handle}</Text>
          ) : (
            <Stack>
              {myKeys.map((key) => (
                <KeyItem
                  key={key.id}
                  $direction="row"
                  $alignItems="center"
                  $justifyContent="space-between"
                >
                  <Stack $direction="row">
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
                      <IdentificationBadge
                        size="16"
                        color={
                          rotationKeys
                            ? isCurrentRotationKey(key, rotationKeys)
                              ? 'var(--color-green)'
                              : 'var(--color-dark-red)'
                            : 'var(--color-gray-medium)'
                        }
                      />
                    </Button>

                    <Button
                      $variant="outline"
                      className="p-1"
                      onClick={() => openKeyDetails(key)}
                      aria-label="View key details"
                    >
                      <Gear size="16" color="var(--color-gray-medium)" />
                    </Button>
                    {/* 
                    TODO: add this back with warnings if it is registered as a rotation key
                    <Button
                      $variant="outline"
                      className="p-1"
                      onClick={() => forgetKey(key)}
                      aria-label="Delete key"
                    >
                      <Trash size="16" color="var(--color-gray-medium)" /> 
                    </Button>
                    */}
                  </Stack>
                </KeyItem>
              ))}
            </Stack>
          )}
        </>
      )}
      <CreateButton onClick={onClickAdd} disabled={generatingKeyPair}>
        New Key
      </CreateButton>
      <Modal
        isOpen={isKeyDetailsDialogOpen}
        onClose={() => setIsKeyDetailsDialogOpen(false)}
        title="Key Details"
        size="md"
      >
        {selectedKeyDetails && (
          <KeyDetails
            dbKey={selectedKeyDetails}
            importKey={importKey}
            onDone={() => setIsKeyDetailsDialogOpen(false)}
          />
        )}
      </Modal>
      <Modal
        isOpen={isRotationKeyDialogOpen}
        onClose={() => setIsRotationKeyDialogOpen(false)}
        title="Rotation Key Status"
        size="md"
      >
        {selectedKeyDetails && (
          <RotationKeyStatus
            did={atprotoAccount}
            rotationKey={selectedKeyDetails}
            onDone={() => setIsRotationKeyDialogOpen(false)}
          />
        )}
      </Modal>
      <Modal
        isOpen={Boolean(newKey)}
        onClose={() => {
          setNewKey(undefined)
          setIsKeyDetailsDialogOpen(false)
        }}
        title="Key Details"
        size="md"
      >
        <Stack $gap="1rem">
          <Text>We&apos;ve created your new key!</Text>
          <KeyDetails
            dbKey={newKey}
            onDone={() => {
              setNewKey(undefined)
            }}
          />
        </Stack>
      </Modal>
    </Stack>
  )
}

export default function Keychain({ atprotoAccount }: { atprotoAccount: Did }) {
  const props = useKeychainContext()
  const { data: profile } = useProfile(atprotoAccount)
  const { handle, rotationKeys } = profile || {}

  return (
    <KeychainView
      {...props}
      handle={handle}
      rotationKeys={rotationKeys}
      atprotoAccount={atprotoAccount}
    />
  )
}
