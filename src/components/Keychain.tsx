'use client'

import { Cog8ToothIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid"
import { useState } from "react"
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { useForm } from "react-hook-form"

import { shortenCID, shortenDID } from "@/lib/ui"
import { KeychainContextProps, useKeychainContext } from "@/contexts/keychain"
import type { Key, KeyImportFn } from "@/contexts/keychain"
import { Loader } from "./Loader"
import CopyButton from "./CopyButton"

interface KeyImportFormParams {
  keyMaterial: string
}

function KeyImportForm ({ dbKey, importKey }: { dbKey: Key, importKey: KeyImportFn }) {
  const {
    register,
    handleSubmit,
  } = useForm<KeyImportFormParams>()
  async function submit (data: KeyImportFormParams) {
    await importKey(dbKey, data.keyMaterial)
  }
  return (
    <form onSubmit={handleSubmit(submit)}
      className="flex flex-col space-y-2" >
      <label>
        <textarea
          className="ipt w-full whitespace-pre"
          {...register('keyMaterial')}
          placeholder="JWK Formatted Key"
        />
      </label>
      <input className="btn text-xs uppercase font-bold" type="submit" value="Confirm" />
    </form >
  )
}

interface KeyDetailsProps {
  dbKey?: Key
  importKey?: KeyImportFn
  onDone?: () => unknown
}

function KeyDetails ({ dbKey, onDone, importKey }: KeyDetailsProps) {
  const [secret, setSecret] = useState<string>()
  const [showImport, setShowImport] = useState<boolean>(false)
  const keyPair = dbKey?.keyPair
  async function showSecret () {
    if (keyPair?.toSecret) {
      setSecret(await keyPair?.toSecret())
    } else {
      console.warn("can't show secret", keyPair)
    }
  }
  function hideSecret () {
    setSecret(undefined)
  }
  async function importAndClose (key: Key, keyMaterial: string) {
    if (importKey) {
      await importKey(key, keyMaterial)
      setShowImport(false)
    } else {
      console.warn('importKey was not defined, cannot import key')
    }

  }
  const did = dbKey?.id || keyPair?.did()
  return (
    <div className="flex flex-col space-y-4">
      {did && (<h3 className="font-bold text-xs uppercase">Key DID: {shortenDID(did)}</h3>)}
      {dbKey?.symkeyCid && (
        <h3 className="font-bold text-xs uppercase">Symkey CID: {shortenCID(dbKey.symkeyCid)}</h3>
      )}
      {(showImport && importKey && dbKey) ? (
        <div>
          <KeyImportForm dbKey={dbKey} importKey={importAndClose} />
        </div>
      ) : (
        secret ? (
          <div className="flex flex-col">
            <div className="whitespace-pre w-96 h-24 font-mono text-xs overflow-scroll">
              {secret}
            </div>
            <div className="flex flex-row space-x-2">
              <button className="btn" onClick={hideSecret}>
                Hide Secret
              </button>
              <div className="btn flex flex-col justify-center items-center">
                <CopyButton text={secret} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {!keyPair?.publicKey && (
              <button className="btn" onClick={() => { setShowImport(true) }}>
                Import Key
              </button>
            )}
            {keyPair?.privateKey && (
              <button className="btn" onClick={showSecret}>
                Show Secret
              </button>
            )}
            {onDone && (
              <button className="btn" onClick={onDone}>
                Done
              </button>
            )}
          </div>
        )
      )}

    </div>
  )
}

type KeychainProps = KeychainContextProps & {
  className?: string
}

export function KeychainView ({
  keys = [],
  generateKeyPair,
  setSelectedKey,
  importKey,
  forgetKey,
  className
}: KeychainProps) {
  const [generatingKeyPair, setGeneratingKeyPair] = useState(false)
  const [newKey, setNewKey] = useState<Key>()
  async function onClickAdd () {
    if (generateKeyPair) {
      setGeneratingKeyPair(true)
      setNewKey(await generateKeyPair())
      setGeneratingKeyPair(false)
    } else {
      console.warn('could not generate key pair, generator function is not defined')
    }
  }
  return (
    <div className={className}>
      {generatingKeyPair ? (
        <Loader />
      ) : (
        newKey ? (
          <div>
            <h3>We&apos;ve created your new key!</h3>
            <KeyDetails dbKey={newKey} onDone={() => { setNewKey(undefined) }} />
          </div>
        ) : (
          <>
            <PlusIcon onClick={onClickAdd} className="w-6 h-6 cursor-pointer hover:bg-gray-200" />
            <div className="flex flex-col">
              {
                keys.map((key, i) => (
                  <div key={i} className="flex flex-row space-x-2 items-center odd:bg-gray-100/80">
                    <div className="w-52 hover:bg-gray-200 cursor-pointer"
                      onClick={() => { setSelectedKey(key) }}>
                      {shortenDID(key.id)}
                    </div>
                    <CopyButton text={key.id} />
                    <Popover className="relative flex items-center">
                      <PopoverButton className="outline-none cursor-pointer hover:bg-gray-100 p-2">
                        <Cog8ToothIcon className="w-4 h-4" />
                      </PopoverButton>
                      <PopoverPanel anchor="bottom" className="flex flex-col bg-white border rounded p-2">
                        <KeyDetails dbKey={key} importKey={importKey} />
                      </PopoverPanel>
                    </Popover>
                    <button className="outline-none cursor-pointer hover:bg-gray-100 p-2" onClick={() => forgetKey(key)}>
                      <TrashIcon className="w-4 h-4" />
                    </button>

                  </div>
                ))
              }
            </div>
          </>
        )
      )
      }
    </div >
  )
}

export default function Keychain () {
  const props = useKeychainContext()
  return <KeychainView {...props} />
}