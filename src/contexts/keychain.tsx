'use client'

import { KeyPair, keyParams, symkeyParams } from '@/lib/crypto/keys'
import { createContext, useContext } from 'react'
import { KeyMeta } from '@/lib/db'
import { cidUrl } from '@/lib/storacha'

export type Key = KeyMeta & {
  keyPair?: KeyPair
}

export type KeyImportFn = (key: Key, keyMaterial: string) => Promise<void>

export type KeychainContextProps = {
  keys: Key[]
  selectedKey?: Key
  setSelectedKey: (key: Key) => unknown
  generateKeyPair?: () => Promise<Key | undefined>
  importKey: KeyImportFn
  forgetKey: (key: Key) => Promise<unknown>
}

export async function hydrateSymkey(key: Key) {
  if (key.symkeyCid && key.keyPair?.privateKey) {
    const resp = await fetch(cidUrl(key.symkeyCid))
    const keyBytes = await crypto.subtle.decrypt(
      keyParams,
      key.keyPair.privateKey,
      await resp.arrayBuffer()
    )
    return await crypto.subtle.importKey('raw', keyBytes, symkeyParams, false, [
      'encrypt',
      'decrypt',
    ])
  } else {
    throw new Error(`could not hydrate symkey from ${key.symkeyCid}`)
  }
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

export const useKeychainContext = () => {
  return useContext(KeychainContext)
}
