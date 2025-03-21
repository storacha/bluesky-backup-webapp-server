'use client'

import { Cog8ToothIcon, PlusIcon, TrashIcon, KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { shortenCID, shortenDID } from "@/lib/ui"
import { KeychainContextProps, useKeychainContext } from "@/contexts/keychain"
import type { Key, KeyImportFn } from "@/contexts/keychain"
import CopyButton from "./CopyButton"
import Button from "./Button"
import Input from "./Input"
import Dialog from "./Dialog"
import { Loader } from "./Loader"

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
      <Input
        as="textarea"
        rows={4}
        className="w-full whitespace-pre"
        {...register('keyMaterial')}
        placeholder="JWK Formatted Key"
      />
      <Button 
        type="submit"
        variant="primary"
        className="text-xs uppercase font-bold"
      >
        Confirm
      </Button>
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
      {did && (
        <div className="flex flex-col space-y-1">
          <h3 className="text-xs font-semibold text-gray-600">KEY DID</h3>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
            <span className="text-sm font-mono mr-2 truncate">{shortenDID(did)}</span>
            <CopyButton text={did} />
          </div>
        </div>
      )}
      
      {dbKey?.symkeyCid && (
        <div className="flex flex-col space-y-1">
          <h3 className="text-xs font-semibold text-gray-600">SYMKEY CID</h3>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
            <span className="text-sm font-mono mr-2 truncate">{shortenCID(dbKey.symkeyCid)}</span>
            <CopyButton text={dbKey.symkeyCid} />
          </div>
        </div>
      )}
      
      {(showImport && importKey && dbKey) ? (
        <div className="mt-2">
          <KeyImportForm dbKey={dbKey} importKey={importAndClose} />
        </div>
      ) : (
        secret ? (
          <div className="flex flex-col mt-2">
            <h3 className="text-xs font-semibold text-gray-600 mb-1">SECRET KEY</h3>
            <div className="whitespace-pre w-full max-h-40 font-mono text-xs overflow-auto bg-gray-100 p-2 rounded-lg border">
              {secret}
            </div>
            <div className="flex flex-row justify-between mt-3">
              <Button 
                variant="secondary"
                onClick={hideSecret}
                leftIcon={<EyeSlashIcon className="h-4 w-4" />}
              >
                Hide
              </Button>
              <CopyButton text={secret} />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-3">
            {!keyPair?.publicKey && (
              <Button 
                variant="secondary"
                onClick={() => { setShowImport(true) }}
              >
                Import Key
              </Button>
            )}
            {keyPair?.privateKey && (
              <Button 
                variant="secondary"
                onClick={showSecret}
                leftIcon={<EyeIcon className="h-4 w-4" />}
              >
                Show Secret
              </Button>
            )}
            {onDone && (
              <Button 
                variant="primary"
                onClick={onDone}
              >
                Done
              </Button>
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
  selectedKey,
  setSelectedKey,
  importKey,
  forgetKey,
  className
}: KeychainProps) {
  const [generatingKeyPair, setGeneratingKeyPair] = useState(false)
  const [newKey, setNewKey] = useState<Key>()
  const [isKeyDetailsDialogOpen, setIsKeyDetailsDialogOpen] = useState(false)
  const [selectedKeyDetails, setSelectedKeyDetails] = useState<Key | null>(null)

  async function onClickAdd() {
    if (generateKeyPair) {
      setGeneratingKeyPair(true)
      setNewKey(await generateKeyPair())
      setGeneratingKeyPair(false)
    } else {
      console.warn('could not generate key pair, generator function is not defined')
    }
  }

  const openKeyDetails = (key: Key) => {
    setSelectedKeyDetails(key);
    setIsKeyDetailsDialogOpen(true);
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Encryption Keys</h2>
        <Button 
          variant="secondary" 
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={onClickAdd}
          className="text-sm"
          disabled={generatingKeyPair}
        >
          New Key
        </Button>
      </div>
      
      {generatingKeyPair ? (
        <div className="text-center py-4">
          <Loader className="h-6 w-6 mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Generating key...</p>
        </div>
      ) : newKey ? (
        <div className="border border-red-200 rounded-lg p-4 mb-4 bg-red-50">
          <h3 className="font-bold mb-2">We&apos;ve created your new key!</h3>
          <KeyDetails 
            dbKey={newKey} 
            onDone={() => { setNewKey(undefined) }} 
          />
        </div>
      ) : (
        <>
          {keys.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <KeyIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No encryption keys found</p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={onClickAdd}
              >
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {keys.map((key) => (
                <div 
                  key={key.id} 
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedKey?.id === key.id ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  } hover:border-red-200 transition-all duration-200`}
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => { setSelectedKey(key) }}
                  >
                    <div className="font-medium">{shortenDID(key.id)}</div>
                    {key.symkeyCid && (
                      <div className="text-xs text-gray-500">Symkey: {shortenCID(key.symkeyCid)}</div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      className="p-1"
                      onClick={() => openKeyDetails(key)}
                      aria-label="View key details"
                    >
                      <Cog8ToothIcon className="h-5 w-5 text-gray-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="p-1"
                      onClick={() => forgetKey(key)}
                      aria-label="Delete key"
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <Dialog
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
      </Dialog>
    </div>
  )
}

export default function Keychain() {
  const props = useKeychainContext()
  return <KeychainView {...props} />
}