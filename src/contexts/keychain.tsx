'use client'

import { Secp256k1Keypair } from '@atproto/crypto'
import { base64pad } from 'multiformats/bases/base64'
import { createContext, useContext, useState } from 'react'
import { toast } from 'sonner'

import {
  Button,
  Heading,
  Modal,
  ModalLeft,
  ModalRight,
  ModalStack,
  Stack,
  StatefulButton,
  Text,
} from '@/components/ui'
import KeyMaterialImportForm from '@/components/ui/KeyMaterialImportForm'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { useStorachaAccount } from '@/hooks/use-plan'
import { useSWR } from '@/lib/swr'
import { shortenDID } from '@/lib/ui'
import { RotationKey } from '@/types'

import type { ReactNode } from 'react'

let recordKey: typeof import('@/actions/recordKey').recordKey
if (process.env.STORYBOOK) {
  recordKey = () => {
    throw new Error('Server Functions are not available in Storybook')
  }
} else {
  recordKey = (await import('@/actions/recordKey')).recordKey
}

export type KeyHydrateFn = (
  key: RotationKey,
  keyMaterial: string
) => Promise<void>

export type KeyImportFn = (atprotoAccount: string) => Promise<void>

export type KeyMaterialImportFn = (keyMaterial: string) => Promise<void>

export type KeychainContextProps = {
  keys: RotationKey[]
  selectedKey?: RotationKey
  setSelectedKey: (key: RotationKey) => unknown
  generateKeyPair?: (atprotoAccount: string) => Promise<RotationKey | undefined>
  hydrateKey: KeyHydrateFn
  importKey: KeyImportFn
  forgetKey: (key: RotationKey) => Promise<unknown>
}

const KeychainContext = createContext<KeychainContextProps>({
  keys: [],
  setSelectedKey: () => {
    console.warn('setSelectedKeyPair is unimplemented')
  },
  hydrateKey: async () => {
    console.warn('hydrateKey is unimplemented')
  },
  importKey: async () => {
    throw new Error('importKey is unimplemented')
  },
  forgetKey: async () => {
    console.warn('forgetKey is unimplemented')
  },
  generateKeyPair: async () => {
    throw new Error('generateKeyPair is unimplemented')
  },
})

export const KeychainProvider = ({
  children,
}: {
  children: ReactNode | ReactNode[]
}) => {
  const [selectedKey, setSelectedKey] = useState<RotationKey>()
  const [isDeletingKey, setIsDeletingKey] = useState(false)
  const storachaAccount = useStorachaAccount()
  const { data: keys, mutate: mutateKeys } = useSWR(['api', `/api/keys`])
  async function generateKeyPair (atprotoAccount: string) {
    if (storachaAccount) {
      const keypair = await Secp256k1Keypair.create({ exportable: true })
      const newKey = await recordKey({
        id: keypair.did(),
        atprotoAccount,
      })
      newKey.keypair = keypair
      setSelectedKey(newKey)
      await mutateKeys()
      return newKey
    } else {
      console.warn('could not find storacha account')
    }
  }
  async function hydrateKey (key: RotationKey, keyMaterial: string) {
    const keypair = await Secp256k1Keypair.import(
      base64pad.decode(keyMaterial),
      { exportable: true }
    )
    if (keypair.did() === key.id) {
      key.keypair = keypair
      setSelectedKey(key)
    } else {
      throw new Error(
        `tried to import private key for ${keypair.did()} to the rotation key ${key.id}`
      )
    }
  }
  const [keyImportAccount, setKeyImportAccount] = useState<string>()

  async function importKey (atProtoAccount: string) {
    setKeyImportAccount(atProtoAccount)
  }

  async function importKeyMaterial (keyMaterial: string) {
    if (!keyImportAccount)
      throw new Error(
        'keyImportAccount is not defined, cannot import key material'
      )
    try {
      const keypair = await Secp256k1Keypair.import(
        base64pad.decode(keyMaterial),
        { exportable: true }
      )
      if (!keys?.map((k) => k.id).includes(keypair.did())) {
        const newKey = await recordKey({
          id: keypair.did(),
          atprotoAccount: keyImportAccount,
        })
        newKey.keypair = keypair
        setSelectedKey(newKey)
        await mutateKeys()
        toast.success(`Imported ${keypair.did()}`)
      } else {
        toast.success(`You already imported ${keypair.did()}`)
      }
    } catch (err: unknown) {
      toast.error(`Error importing key: ${err}`)
    } finally {
      setKeyImportAccount(undefined)
    }
  }
  const [forgettableKey, setForgettableKey] = useState<RotationKey>()
  async function forgetKey (key: RotationKey) {
    setForgettableKey(key)
  }

  async function deleteKey (key?: RotationKey) {
    if (!key) throw new Error('key is undefined, cannot delete key')
    setIsDeletingKey(true)
    try {
      const response = await fetch(`/api/keys/${encodeURIComponent(key.id)}`, {
        method: 'DELETE',
      })
      if (response.status === 200) {
        await mutateKeys()
        setForgettableKey(undefined)
        toast.success(`Deleted recovery key ${key.id}`)
      } else {
        console.error('delete failed: ', await response.text())
        toast.success(`Failed to delete ${key.id}`)
      }
    } finally {
      setIsDeletingKey(false)
    }
  }
  function closeForgetKey () {
    setForgettableKey(undefined)
  }
  const breakpoints = useMobileScreens()
  return (
    <KeychainContext.Provider
      value={{
        keys: keys ?? [],
        selectedKey,
        setSelectedKey,
        generateKeyPair,
        hydrateKey,
        importKey,
        forgetKey,
      }}
    >
      {children}
      <Modal
        isOpen={Boolean(forgettableKey)}
        onClose={closeForgetKey}
        size="lg"
        background="var(--color-light-blue-100)"
      >
        <ModalStack {...breakpoints}>
          <ModalLeft {...breakpoints}>
            <Stack $gap="1rem">
              <Heading>Forget Key?</Heading>
              <Text>
                Are you sure you want to forget{' '}
                {forgettableKey && shortenDID(forgettableKey.id)} ?
              </Text>
              <Text>
                As long as you have the private key backed up you can reload it
                later.
              </Text>
            </Stack>
          </ModalLeft>
          <ModalRight $justifyContent="center" {...breakpoints}>
            <Stack $direction="row" $gap="1rem">
              <StatefulButton
                disabled={isDeletingKey}
                isLoading={isDeletingKey}
                onClick={() => {
                  deleteKey(forgettableKey)
                }}
                $fontSize="1rem"
              >
                Yes!&nbsp;Forget&nbsp;it.
              </StatefulButton>
              <Button onClick={closeForgetKey}
                $fontSize="1rem"
              >
                No,&nbsp;nevermind!
              </Button>
            </Stack>
          </ModalRight>
        </ModalStack>
      </Modal>
      <Modal
        isOpen={Boolean(keyImportAccount)}
        onClose={() => setKeyImportAccount(undefined)}
        size="md"
        background="var(--color-light-blue-100)"
      >
        <ModalStack {...breakpoints}>
          <ModalLeft {...breakpoints}>
            <Heading>Import Key</Heading>
            <Text>Paste a private key to start tracking it.</Text>
          </ModalLeft>
          <ModalRight $justifyContent="center" {...breakpoints}>
            <KeyMaterialImportForm importKeyMaterial={importKeyMaterial} />
          </ModalRight>
        </ModalStack>
      </Modal>
    </KeychainContext.Provider>
  )
}

export const useKeychainContext = () => {
  return useContext(KeychainContext)
}
