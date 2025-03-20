'use client'

import { generateNewKeyPair, generateNewSymkey, KeyPair, keyParams, keysToKeypair, symkeyParams } from "@/lib/crypto/keys";
import type { ReactNode } from "react";
import { createContext, useContext, useState, } from "react";
import { useBackupsContext } from "./backups";
import { useLiveQuery } from "dexie-react-hooks";
import { useW3 } from "@w3ui/react";
import { KeyMeta } from "@/lib/db";
import { cidUrl } from "@/lib/storacha";

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
};

export async function hydrateSymkey (key: Key) {
  if (key.symkeyCid && key.keyPair?.privateKey) {
    const resp = await fetch(cidUrl(key.symkeyCid))
    const keyBytes = await crypto.subtle.decrypt(
      keyParams,
      key.keyPair.privateKey,
      await resp.arrayBuffer()
    )
    return await crypto.subtle.importKey('raw', keyBytes, symkeyParams, false, ['encrypt', 'decrypt'])
  } else {
    throw new Error(`could not hydrate symkey from ${key.symkeyCid}`)
  }
}

export const KeychainContext = createContext<KeychainContextProps>({
  keys: [],
  setSelectedKey: () => { console.warn('setSelectedKeyPair is unimplemented') },
  importKey: async () => { console.warn('importKey is unimplemented') },
  forgetKey: async () => { console.warn('forgetKey is unimplemented') },
  generateKeyPair: async () => { throw new Error('generateKeyPair is unimplemented') }
});

export const KeychainProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const { backupsStore } = useBackupsContext()
  const [selectedKey, setSelectedKey] = useState<Key>()
  const [storacha] = useW3()
  async function generateKeyPair () {
    if (storacha.client) {
      const keyPair = await generateNewKeyPair()
      if (keyPair.publicKey) {
        const symkey = await generateNewSymkey()
        const cid = await storacha.client.uploadFile(
          new Blob([await crypto.subtle.encrypt(keyParams, keyPair.publicKey,
            await crypto.subtle.exportKey('raw', symkey)
          )])
        )
        const newKey: Key = await backupsStore.addKey(keyPair.did(), cid.toString())
        newKey.keyPair = keyPair
        setSelectedKey(newKey)
        return newKey
      } else {
        console.warn("keypair was generated without a public key, that's weird")
      }
    } else {
      console.warn('could not create symmetric key, no storacha client to store it with')
    }

  }
  const keys = useLiveQuery(() => backupsStore.listKeys())
  async function importKey (key: Key, keyMaterial: string) {
    const keys = JSON.parse(keyMaterial)
    const privateKey = await crypto.subtle.importKey('jwk', keys.privateKey, keyParams, true, ['decrypt'])
    const publicKey = await crypto.subtle.importKey('jwk', keys.publicKey, keyParams, true, ['encrypt'])
    key.keyPair = await keysToKeypair({ publicKey, privateKey })
    setSelectedKey(key)
  }
  async function forgetKey (key: Key) {
    await backupsStore.deleteKey(key.id)
  }
  return (
    <KeychainContext.Provider value={{
      keys: keys ?? [], selectedKey,
      setSelectedKey, generateKeyPair,
      importKey, forgetKey
    }}>
      {children}
    </KeychainContext.Provider >
  )
}

export const useKeychainContext = () => {
  return useContext(KeychainContext);
};
