'use client'

import { BskyAuthContextProps, useBskyAuthContext } from "@/contexts"
import { backupBlobs, backupPrefs, backupRepo, initializeBackup } from "@/lib/bluesky"
import { ContextState as StorachaContext, Space, useW3 } from "@w3ui/react"
import { useState } from "react"
import { SpaceFinder } from "./SpaceFinder"
import { useLiveQuery } from "dexie-react-hooks"
import { AdjustmentsHorizontalIcon, ArrowRightCircleIcon, CircleStackIcon, CloudIcon } from "@heroicons/react/20/solid"
import { useBackupsContext } from "@/contexts/backups"
import { Blob, PrefsDoc, Repo } from "@/lib/db"
import { Loader } from "./Loader"
import { CreateSpaceModal } from "./CreateSpace"

export default function BackupUI () {
  const { backupsStore: backupMetadataStore } = useBackupsContext()
  const [isBackingUpRepo, setIsBackingUpRepo] = useState(false)
  const [isBackingUpPrefsDoc, setIsBackingUpPrefsDoc] = useState(false)
  const [isBackingUpBlobs, setIsBackingUpBlobs] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<Space>()
  const [currentBackupId, setCurrentBackupId] = useState<number>()
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
      setCurrentBackupId(await initializeBackup(bluesky.userProfile, backupMetadataStore))
    }
  }

  async function onClickBackupRepo () {
    const backupId = currentBackupId
    if (backupId && space && bluesky.userProfile && bluesky.agent && storacha.client) {
      setIsBackingUpRepo(true)
      await backupRepo(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore, { eventTarget: backupEvents })
      setIsBackingUpRepo(false)
    } else {
      console.log('not backing up, profile, agent, client:', bluesky.userProfile, bluesky.agent, storacha.client)
    }
  }

  async function onClickBackupPrefsDoc () {
    const backupId = currentBackupId
    if (backupId && space && bluesky.userProfile && bluesky.agent && storacha.client) {
      setIsBackingUpPrefsDoc(true)
      await backupPrefs(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore, { eventTarget: backupEvents })
      setIsBackingUpPrefsDoc(false)
    } else {
      console.log('not backing up, profile, agent, client:', bluesky.userProfile, bluesky.agent, storacha.client)
    }
  }

  async function onClickBackupBlobs () {
    const backupId = currentBackupId
    if (backupId && space && bluesky.userProfile && bluesky.agent && storacha.client) {
      setIsBackingUpBlobs(true)
      await backupBlobs(backupId, bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore, { eventTarget: backupEvents })
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
    blobs={blobs}
    repo={repo}
    prefsDoc={prefsDoc}
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
}

export function BackupUIView ({
  bluesky, storacha, space, setSelectedSpace,
  backupEvents, currentBackupId,
  isBackingUpRepo,
  isBackingUpBlobs,
  isBackingUpPrefsDoc,
  onClickBackupBlobs,
  onClickBackupRepo,
  onClickBackupPrefsDoc,
  onClickInitializeBackup,
  onClickQuickPublicBackup,
  repo,
  blobs,
  prefsDoc
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
        <div>
          {space ? (
            currentBackupId ? (
              <div className="flex flex-col w-xl">
                <div className="flex flex-row justify-between items-center mb-4 space-x-8">
                  <h3 className="uppercase font-bold">Creating Backup #{currentBackupId}</h3>
                  <div className="flex flex-col gap-1">
                    <h4 className="uppercase text-xs font-bold text-right">Storacha Space</h4>
                    <SpaceFinder
                      selected={space} setSelected={setSelectedSpace} spaces={storacha.spaces}
                      className="w-52 -mt-1"
                    />
                    <p className="text-sm">Don&apos;t want to use this space?</p>
                    <p
                      onClick={() => setIsModalOpen(true)}
                      className="underline text-sm hover:cursor-pointer"
                    >
                      Create a new one
                    </p>
                  </div>
                </div>
                <div className="flex flex-row items-center w-full">
                  <div className="w-28"></div>
                  <div className="w-24">
                    <h4 className="text-center uppercase text-xs font-bold">
                      {bluesky.session?.server.issuer.split("//")[1]}
                    </h4>
                    <div className="text-xs w-full truncate">{bluesky.userProfile?.did}</div>
                  </div>
                  <div className="w-6 h-6">
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
                  <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                    <CircleStackIcon className="w-4 h-4" />
                  </div>
                  {isBackingUpRepo ? (
                    <Loader className="w-6 h-6" />
                  ) : (
                    <button
                      onClick={onClickBackupRepo} disabled={!space || isBackingUpBlobs}
                      className="rounded-full cursor-pointer hover:bg-red-400 border">
                      <ArrowRightCircleIcon className="w-6 h-6" />
                    </button>
                  )}
                  <div className={`${repo ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                    <CircleStackIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-row items-center my-2 space-x-8">
                  <h5 className="font-bold uppercase text-sm text-right w-28">Blobs</h5>
                  <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                    <CloudIcon className="w-4 h-4" />
                  </div>
                  {isBackingUpBlobs ? (
                    <Loader className="w-6 h-6" />
                  ) : (
                    <button
                      onClick={onClickBackupBlobs} disabled={!space || isBackingUpBlobs}
                      className="rounded-full cursor-pointer hover:bg-red-400 border">
                      <ArrowRightCircleIcon className="w-6 h-6" />
                    </button>
                  )}
                  <div className={`${blobs && (blobs.length > 0) ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                    <span className="font-bold text-sm ">
                      {blobs?.length || '0'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row items-center my-2 space-x-8">
                  <h5 className="font-bold uppercase text-sm text-right w-28">Preferences</h5>
                  <div className="rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center">
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  </div>
                  {isBackingUpPrefsDoc ? (
                    <Loader className="w-6 h-6" />
                  ) : (
                    <button
                      onClick={onClickBackupPrefsDoc} disabled={!space || isBackingUpPrefsDoc}
                      className="rounded-full cursor-pointer hover:bg-red-400 border">
                      <ArrowRightCircleIcon className="w-6 h-6" />
                    </button>
                  )}
                  <div className={`${prefsDoc ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'} rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center`}>
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-100 justify-center items-center gap-1">
                <button
                  onClick={onClickInitializeBackup} disabled={!space}
                  className="btn">
                  Initialize Backup
                </button>
                <span className="font-bold">OR</span>
                <button
                  onClick={onClickQuickPublicBackup} disabled={!space}
                  className="btn">
                  Quick Public Data Backup
                </button>
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
                <p className="text-md text-center w-150">
                  You are logged in to Storacha, but we could not find any Storacha Spaces. Click the button below to create one.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hover:cursor-pointer w-40 h-10 rounded-3xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Create new Space
                </button>
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
