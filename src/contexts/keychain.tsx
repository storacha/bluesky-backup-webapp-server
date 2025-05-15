'use client'

import { Secp256k1Keypair } from '@atproto/crypto'
import { base64pad } from 'multiformats/bases/base64'
import { createContext, useContext, useState } from 'react'

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
  const storachaAccount = useStorachaAccount()
  async function generateKeyPair(atprotoAccount: string) {
    if (storachaAccount) {
      const keypair = await Secp256k1Keypair.create({ exportable: true })
      const newKey = await recordKey({
        id: keypair.did(),
        atprotoAccount,
      })
      newKey.keypair = keypair
      setSelectedKey(newKey)
      return newKey
    } else {
      console.warn('could not find storacha account')
    }
  }
  const { data: keys } = useSWR(['api', `/api/keys`])
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
  async function forgetKey(key: RotationKey) {
    // TODO implement this
    console.warn(`forgetKey is not implemented, but was called with`, key)
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
    </KeychainContext.Provider>
  )
}

export const useKeychainContext = () => {
  return useContext(KeychainContext)
}
