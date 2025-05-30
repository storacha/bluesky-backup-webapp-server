'use client'

import { Secp256k1Keypair } from '@atproto/crypto'
import { base64pad } from 'multiformats/bases/base64'
import { createContext, useContext, useState } from 'react'
import { toast } from 'sonner'

import { Button, Modal, Stack, StatefulButton, Text } from '@/components/ui'
import { useStorachaAccount } from '@/hooks/use-plan'
import { useSWR } from '@/lib/swr'
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

export type KeyImportFn = (
  key: RotationKey,
  keyMaterial: string
) => Promise<void>

export type KeychainContextProps = {
  keys: RotationKey[]
  selectedKey?: RotationKey
  setSelectedKey: (key: RotationKey) => unknown
  generateKeyPair?: (atprotoAccount: string) => Promise<RotationKey | undefined>
  importKey: KeyImportFn
  forgetKey: (key: RotationKey) => Promise<unknown>
}

const KeychainContext = createContext<KeychainContextProps>({
  keys: [],
  setSelectedKey: () => {
    console.warn('setSelectedKeyPair is unimplemented')
  },
  importKey: async () => {
    console.warn('importKey is unimplemented')
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
  async function generateKeyPair(atprotoAccount: string) {
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
  async function importKey(key: RotationKey, keyMaterial: string) {
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
  const [forgettableKey, setForgettableKey] = useState<RotationKey>()
  async function forgetKey(key: RotationKey) {
    setForgettableKey(key)
  }

  async function deleteKey(key?: RotationKey) {
    if (!key) throw new Error('key is undefined, cannot delete key')
    setIsDeletingKey(true)
    try {
      const response = await fetch(`/api/keys/${encodeURIComponent(key.id)}`, {
        method: 'DELETE',
      })
      if (response.status === 200) {
        await mutateKeys()
        setForgettableKey(undefined)
        toast.success(`Deleted rotation key ${key.id}`)
      } else {
        console.error('delete failed: ', await response.text())
        toast.success(`Failed to delete ${key.id}`)
      }
    } finally {
      setIsDeletingKey(false)
    }
  }

  return (
    <KeychainContext.Provider
      value={{
        keys: keys ?? [],
        selectedKey,
        setSelectedKey,
        generateKeyPair,
        importKey,
        forgetKey,
      }}
    >
      {children}
      <Modal
        isOpen={Boolean(forgettableKey)}
        onClose={() => setForgettableKey(undefined)}
        title="Forget Key?"
        size="md"
      >
        <Stack $gap="1rem">
          <Text>Are you sure you want to forget {forgettableKey?.id} ?</Text>
          <Text>
            As long as you have the private key backed up you can reload it
            later.
          </Text>
          <Stack $direction="row" $gap="1rem">
            <StatefulButton
              disabled={isDeletingKey}
              isLoading={isDeletingKey}
              onClick={() => {
                deleteKey(forgettableKey)
              }}
            >
              Yes, forget it!
            </StatefulButton>
            <Button
              onClick={() => {
                setForgettableKey(undefined)
              }}
            >
              No, nevermind
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </KeychainContext.Provider>
  )
}

export const useKeychainContext = () => {
  return useContext(KeychainContext)
}
