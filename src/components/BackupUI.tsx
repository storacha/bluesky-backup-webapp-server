'use client'

import { BskyAuthContextProps, useBskyAuthContext } from "@/contexts"
import { backupBlobs, backupPrefs, backupRepo, initializeBackup } from "@/lib/bluesky"
import { ContextState as StorachaContext, Space, useW3 } from "@w3ui/react"
import { useState } from "react"
import { SpaceFinder } from "./SpaceFinder"
import { useLiveQuery } from "dexie-react-hooks"
import { AdjustmentsHorizontalIcon, ArrowRightCircleIcon, CircleStackIcon, CloudIcon, PlusCircleIcon, KeyIcon, LockClosedIcon } from "@heroicons/react/20/solid"
import { useBackupsContext } from "@/contexts/backups"
import { Blob, PrefsDoc, Repo } from "@/lib/db"
import { CreateSpaceModal } from "./CreateSpace"
import Button from "./Button"
import { Key, useKeychainContext } from "@/contexts/keychain"
import { shortenDID } from "@/lib/ui"
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import Keychain from "./Keychain"

interface EncryptionButtonProps {
  state: boolean
  setState: (state: boolean) => unknown
  selectedKey?: Key
}

function EncryptionButton ({ state, setState, selectedKey }: EncryptionButtonProps) {
  const encryptionEnabled = selectedKey && state
  return (
    <LockClosedIcon
      className={`w-6 h-6 cursor-pointer p-1 rounded-lg ${encryptionEnabled ? 'text-emerald-500 hover:bg-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}
      onClick={() => { setState(Boolean(selectedKey && !state)) }} />
  )
}

export default function BackupUI () {
  const { selectedKey, } = useKeychainContext()
  const { backupsStore: backupMetadataStore } = useBackupsContext()
  const [isBackingUpRepo, setIsBackingUpRepo] = useState(false)
  const [isBackingUpPrefsDoc, setIsBackingUpPrefsDoc] = useState(false)
  const [isBackingUpBlobs, setIsBackingUpBlobs] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<Space>()
  const [currentBackupId, setCurrentBackupId] = useState<number>()
  const [encryptRepo, setEncryptRepo] = useState<boolean>(false)
  const [encryptPrefsDoc, setEncryptPrefsDoc] = useState<boolean>(!!selectedKey)
  const [encryptBlobs, setEncryptBlobs] = useState<boolean>(false)

  const [storacha] = useW3()
  const bluesky = useBskyAuthContext()
  const backupEvents = new EventTarget()
  const space = selectedSpace ?? storacha?.spaces?.[0]
  const repo = useLiveQuery(() => currentBackupId ? backupMetadataStore.getRepo(currentBackupId) : null, [currentBackupId])
  const prefsDoc = useLiveQuery(() => currentBackupId ? backupMetadataStore.getPrefsDoc(currentBackupId) : null, [currentBackupId])
  const blobs = useLiveQuery(() => currentBackupId ? backupMetadataStore.listBlobs(currentBackupId) : null, [currentBackupId])

  async function onClickQuickPublicBackup () {
    // only backup public info
    if (space && bluesky.userProfile && bluesky.agent && storacha.client) {
      await storacha.client.setCurrentSpace(space.did())
      const backupId = await initializeBackup(bluesky.userProfile, backupMetadataStore)
      await backupRepo(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore, { eventTarget: backupEvents })
      await backupBlobs(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore, { eventTarget: backupEvents })
    }
  }

  async function onClickInitializeBackup () {
    if (space && bluesky.userProfile && bluesky.agent && storacha.client) {
      await storacha.client.setCurrentSpace(space.did())
      const backupId = await initializeBackup(bluesky.userProfile, backupMetadataStore)
      setCurrentBackupId(backupId)
    } else {
      console.log("can't start backup", space, bluesky, storacha)
    }
  }

  async function onClickBackupRepo () {
    const backupId = currentBackupId
    if (backupId && space && bluesky.userProfile && bluesky.agent && storacha.client) {
      setIsBackingUpRepo(true)
      await backupRepo(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore,
        { eventTarget: backupEvents, encryptionKey: encryptRepo ? selectedKey : undefined })
      setIsBackingUpRepo(false)
    } else {
      console.log('not backing up, profile, agent, client:', bluesky.userProfile, bluesky.agent, storacha.client)
    }
  }

  async function onClickBackupPrefsDoc () {
    const backupId = currentBackupId
    if (backupId && space && bluesky.userProfile && bluesky.agent && storacha.client) {
      setIsBackingUpPrefsDoc(true)
      await backupPrefs(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore,
        { eventTarget: backupEvents, encryptionKey: encryptPrefsDoc ? selectedKey : undefined }
      )
      setIsBackingUpPrefsDoc(false)
    } else {
      console.log('not backing up, profile, agent, client:', bluesky.userProfile, bluesky.agent, storacha.client)
    }
  }

  async function onClickBackupBlobs () {
    const backupId = currentBackupId
    if (backupId && space && bluesky.userProfile && bluesky.agent && storacha.client) {
      setIsBackingUpBlobs(true)
      await backupBlobs(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore,
        { eventTarget: backupEvents, encryptionKey: encryptBlobs ? selectedKey : undefined }
      )
      setIsBackingUpBlobs(false)
    } else {
      console.log('not backing up, profile, agent, client:', bluesky.userProfile, bluesky.agent, storacha.client)
    }
  }


  return <BackupUIView bluesky={bluesky} storacha={storacha}
    space={space} setSelectedSpace={setSelectedSpace} backupEvents={backupEvents}
    currentBackupId={currentBackupId}
    isBackingUpRepo={isBackingUpRepo}
    isBackingUpPrefsDoc={isBackingUpPrefsDoc}
    isBackingUpBlobs={isBackingUpBlobs}
    onClickBackupBlobs={onClickBackupBlobs}
    onClickBackupPrefsDoc={onClickBackupPrefsDoc}
    onClickBackupRepo={onClickBackupRepo}
    onClickInitializeBackup={onClickInitializeBackup}
    onClickQuickPublicBackup={onClickQuickPublicBackup}
    setEncryptRepo={setEncryptRepo}
    encryptRepo={encryptRepo}
    setEncryptPrefsDoc={setEncryptPrefsDoc}
    encryptPrefsDoc={encryptPrefsDoc}
    setEncryptBlobs={setEncryptBlobs}
    encryptBlobs={encryptBlobs}
    blobs={blobs}
    repo={repo}
    prefsDoc={prefsDoc}
    selectedKey={selectedKey}
  />
}

export interface BackupUIViewProps {
  bluesky: BskyAuthContextProps
  storacha: StorachaContext
  space: Space
  setSelectedSpace: (space: Space) => void
  backupEvents: EventTarget
  currentBackupId?: number
  isBackingUpRepo: boolean
  isBackingUpPrefsDoc: boolean
  isBackingUpBlobs: boolean
  onClickBackupBlobs: () => void
  onClickBackupRepo: () => void
  onClickBackupPrefsDoc: () => void
  onClickInitializeBackup: () => void
  onClickQuickPublicBackup: () => void
  repo?: Repo | null
  blobs?: Blob[] | null
  prefsDoc?: PrefsDoc | null
  encryptRepo: boolean
  setEncryptRepo: (value: boolean) => unknown
  encryptPrefsDoc: boolean
  setEncryptPrefsDoc: (value: boolean) => unknown
  encryptBlobs: boolean
  setEncryptBlobs: (value: boolean) => unknown
  selectedKey?: Key
}

export function BackupUIView ({
  bluesky, storacha, space,
  setSelectedSpace,
  encryptRepo, setEncryptRepo,
  encryptPrefsDoc, setEncryptPrefsDoc,
  encryptBlobs, setEncryptBlobs,
  backupEvents, currentBackupId,
  isBackingUpRepo,
  isBackingUpBlobs,
  isBackingUpPrefsDoc,
  onClickBackupBlobs,
  onClickBackupRepo,
  onClickBackupPrefsDoc,
  onClickInitializeBackup,
  repo,
  blobs,
  prefsDoc,
  selectedKey
}: BackupUIViewProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const userAuthenticatedToBothServices = bluesky.userProfile && storacha.accounts[0]
  const [backupProgressComponent, setBackupProgressComponent] = useState(
    <>
      Backing up your Bluesky account...
    </>
  )
  backupEvents.addEventListener('repo:fetching', () => {
    setBackupProgressComponent(
      <>
        Backing up your Bluesky account...
      </>
    )
  })
  backupEvents.addEventListener('repo:fetching', () => {
    setBackupProgressComponent(
      <>
        Backing up your Bluesky account...
      </>
    )
  })
  backupEvents.addEventListener('repo:uploaded', () => {
    setBackupProgressComponent(
      <>
        Repo uploaded...
      </>
    )
  })
  backupEvents.addEventListener('prefs:fetching', () => {
    setBackupProgressComponent(
      <>
        Fetching preferences...
      </>
    )
  })
  backupEvents.addEventListener('prefs:uploading', () => {
    setBackupProgressComponent(
      <>
        Backing up preferences...
      </>
    )
  })
  backupEvents.addEventListener('prefs:uploaded', () => {
    setBackupProgressComponent(
      <>
        Preferences backed up!
      </>
    )
  })
  backupEvents.addEventListener('blob:fetching', (e) => {
    const { i: loaded, count: total } = (e as CustomEvent).detail ?? { i: 0, count: 1 }
    const percentComplete = Math.floor((loaded / total) * 100)
    setBackupProgressComponent(
      <div>
        <h3>Backing up your blobs, this may take a while...</h3>
        <div className='relative flex flex-row justify-start border'>
          <div className='bg-black h-4' style={{ width: `${percentComplete}%` }}>
          </div>
        </div>
      </div>
    )
  })
  const isBackingUp = isBackingUpBlobs || isBackingUpPrefsDoc || isBackingUpRepo
  return (
    <>
      {userAuthenticatedToBothServices ? (
        <div className="flex flex-col items-center">
          {space ? (
            currentBackupId ? (
              <div className="flex flex-col items-center w-xl">
                <div className="flex flex-row justify-between items-center mb-4 space-x-8">
                  <h3 className="uppercase font-bold">Creating Backup #{currentBackupId}</h3>
                  <div className="flex flex-row items-center w-52">
                    <Popover className="relative">
                      <PopoverButton className="outline-none cursor-pointer hover:bg-gray-100 p-2">
                        <KeyIcon className="w-6 h-6" />
                      </PopoverButton>
                      <PopoverPanel anchor="bottom" className="flex flex-col bg-white border rounded p-2">
                        <Keychain />
                      </PopoverPanel>
                    </Popover>
                    <h3 className="font-bold uppercase text-sm">
                      {selectedKey && shortenDID(selectedKey.id)}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="uppercase text-xs font-bold text-right">Storacha Space</h4>
                    <SpaceFinder
                      selected={space} setSelected={setSelectedSpace} spaces={storacha.spaces}
                      className="-mt-1 max-w-lg"
                    />
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <Button
                        onClick={() => setIsModalOpen(true)}
                        variant="ghost"
                      >
                        <PlusCircleIcon className="h-5 w-5 mr-1" />
                        <span className="text-sm">Create new</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="prose-sm text-center mb-4">
                  <p>
                    Use the <b>keychain</b> 🗝️ above to create a private key if you&apos;d like to encrypt your data. Be sure to export 📝 your key and <b>save</b> it in a password manager or another <b>secure</b> location!
                  </p>
                  <p>
                    If you <b>don&apos;t</b> want to encrypt 🤪, or if you&apos;ve already created a key ✅, you can back up your <b>ATProto Repository</b> 🔗, &ldquo;blobs&rdquo; of data like images 🏞️ and videos, and preferences 🛠️ <b>separately</b> below ⤵️.
                  </p>
                  <p>
                    If you choose not to <b>encrypt</b> 😰, please know that your data will be uploaded to a <b>public network</b> replicated around the world 🌍🌏🌎 - while it can be deleted from <b>Storacha&apos;s</b> 🐔 servers, once it&apos;s <b>flown the coop</b> 🐣 it will be hard to ensure it&apos;s really gone!
                  </p>
                  <p>
                    Encrypting at least your preferences is highly recommended 🤓 - they are <b>private</b> on your PDS 👁️!
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-row items-center w-full space-x-0 my-4">
                    <div className="w-36"></div>
                    <div className="w-24">
                      <h4 className="text-center uppercase text-xs font-bold">
                        {bluesky.session?.server.issuer.split("//")[1]}
                      </h4>
                      <div className="text-xs w-full truncate text-center">
                        {bluesky.userProfile?.did}
                      </div>
                    </div>
                    <div className="w-24 h-6">
                    </div>
                    <div className="w-24">
                      <h4 className="text-center uppercase text-xs font-bold">
                        Storacha
                      </h4>
                      <div className="text-xs w-full truncate text-center">{space.name || space.did()}</div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center my-2 space-x-8">
                    <h5 className="font-bold uppercase text-sm text-right w-28">Repository</h5>
                    <div className="ml-8 rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                      <CircleStackIcon className="w-4 h-4" />
                    </div>
                    <EncryptionButton state={encryptRepo} setState={setEncryptRepo} selectedKey={selectedKey} />
                    {isBackingUpRepo ? (
                      <Button
                        isLoading
                        hideLoadingText
                        variant="outline"
                        className="rounded-full w-8 h-8"
                        aria-label="Backing up repository"
                      />
                    ) : (
                      <Button
                        onClick={onClickBackupRepo}
                        disabled={!space || isBackingUpBlobs}
                        variant="outline"
                        className="rounded-full w-8 h-8"
                        leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                      />
                    )}
                    <div className="flex flex-row items-center">
                      <div className={`${repo ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                        <CircleStackIcon className="w-4 h-4" />
                      </div>
                      {repo && encryptRepo && (
                        <LockClosedIcon
                          className={`w-6 h-6 cursor-pointer p-1 rounded-lg text-emerald-500`} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-center my-2 space-x-8">
                    <h5 className="font-bold uppercase text-sm text-right w-28">Blobs</h5>
                    <div className="ml-8 rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                      <CloudIcon className="w-4 h-4" />
                    </div>
                    <EncryptionButton state={encryptBlobs} setState={setEncryptBlobs} selectedKey={selectedKey} />
                    {isBackingUpBlobs ? (
                      <Button
                        isLoading
                        hideLoadingText
                        variant="outline"
                        className="rounded-full w-8 h-8"
                        aria-label="Backing up blobs"
                      />
                    ) : (
                      <Button
                        onClick={onClickBackupBlobs}
                        disabled={!space || isBackingUpBlobs}
                        variant="outline"
                        className="rounded-full w-8 h-8"
                        leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                      />
                    )}
                    <div className="flex flex-row items-center">
                      <div className={`${blobs && (blobs.length > 0) ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                        <span className="font-bold text-sm ">
                          {blobs?.length || '0'}
                        </span>
                      </div>
                      {blobs && (blobs.length > 0) && encryptBlobs && (
                        <LockClosedIcon
                          className={`w-6 h-6 cursor-pointer p-1 rounded-lg text-emerald-500`} />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row items-center my-2 space-x-8">
                    <h5 className="font-bold uppercase text-sm text-right w-28">Preferences</h5>
                    <div className="ml-8 rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                      <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    </div>
                    <EncryptionButton state={encryptPrefsDoc} setState={setEncryptPrefsDoc} selectedKey={selectedKey} />
                    {isBackingUpPrefsDoc ? (
                      <Button
                        isLoading
                        hideLoadingText
                        variant="outline"
                        className="rounded-full w-8 h-8"
                        aria-label="Backing up preferences"
                      />
                    ) : (
                      <Button
                        onClick={onClickBackupPrefsDoc}
                        disabled={!space || isBackingUpPrefsDoc}
                        variant="outline"
                        className="rounded-full w-8 h-8"
                        leftIcon={<ArrowRightCircleIcon className="w-6 h-6" />}
                      />
                    )}
                    <div className="flex flex-row items-center">
                      <div className={`${prefsDoc ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                      </div>
                      {prefsDoc && encryptPrefsDoc && (
                        <LockClosedIcon
                          className={`w-6 h-6 cursor-pointer p-1 rounded-lg text-emerald-500`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center space-y-4">
                <div className="prose-sm text-center mb-8">
                  <p>
                    {`Great, you're logged in to Bluesky 🦋 and Storacha 🐔!`}
                  </p>
                  <p>
                    {`Click "Initialize Backup" 👇 to get started 👷 with your first backup 👈!`}
                  </p>
                </div>
                <Button
                  onClick={onClickInitializeBackup}
                  disabled={!space}
                  variant="primary"
                >
                  Initialize Backup
                </Button>
              </div>
            )
          ) : (
            storacha.spaces && (storacha.spaces.length > 0) ? (
              <div>
                <p>Please choose the Storacha space where you&apos;d like to back up your Bluesky account:</p>
                <SpaceFinder
                  selected={space} setSelected={setSelectedSpace} spaces={storacha.spaces}
                  className="w-52"
                />
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <p className="text-md text-center max-w-xl">
                  You are logged in to Storacha, but we could not find any Storacha Spaces.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="primary"
                >
                  Create new Space
                </Button>
              </div>
            )
          )}
          {isBackingUp && (
            <div className="mt-2 mx-8 text-left text-xs text-red-800 uppercase">
              {backupProgressComponent}
            </div>
          )}
        </div>
      ) : (
        <div>Please authenticate to both Bluesky and Storacha to continue.</div>
      )}
      {isModalOpen && (
        <CreateSpaceModal account={storacha.accounts?.[0]} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )

}
