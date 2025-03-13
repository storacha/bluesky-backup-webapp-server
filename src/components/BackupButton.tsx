'use client'

import { useBskyAuthContext } from "@/contexts"
import { backup } from "@/lib/bluesky"
import { Space, useW3 } from "@w3ui/react"
import { useState } from "react"
import { SpaceFinder } from "./SpaceFinder"
import { BackupMetadataStore } from "@/lib/backupMetadataStore"

export interface BackupButtonProps {
  backupMetadataStore: BackupMetadataStore
}

export default function BackupButton ({
  backupMetadataStore,
}: BackupButtonProps) {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<Space>()
  const [storacha] = useW3()
  const bluesky = useBskyAuthContext()
  const backupEvents = new EventTarget()
  const space = selectedSpace ?? storacha?.spaces?.[0]
  async function onClick () {
    if (space && bluesky.userProfile && bluesky.agent && storacha.client) {
      await storacha.client.setCurrentSpace(space.did())

      setIsBackingUp(true)
      await backup(bluesky.userProfile, bluesky.agent, storacha.client, backupMetadataStore, { eventTarget: backupEvents })
      setIsBackingUp(false)
    } else {
      console.log('not backing up, profile, agent, client:', bluesky.userProfile, bluesky.agent, storacha.client)
    }
  }
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
  backupEvents.addEventListener('prefs:uploading', () => {
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
  return userAuthenticatedToBothServices ? (
    isBackingUp ? (
      <div>
        {backupProgressComponent}
      </div>
    ) : (
      <div>
        {storacha.spaces && (storacha.spaces.length > 0) ? (
          <div>
            <p>Please choose the Storacha space where you&apos;d like to back up your Bluesky account:</p>
            <SpaceFinder
              selected={space} setSelected={setSelectedSpace} spaces={storacha.spaces}
              className="w-52" />
          </div>
        ) : (
          <div>You are logged in to Storacha, but we could not find any Storacha Spaces - please create one using the CLI or Storacha Web Console and then reload this page.</div>
        )}
        {space && (
          <button
            onClick={onClick} disabled={!space}
            className="btn">
            Back It Up!
          </button>
        )}
      </div>
    )
  ) : (
    <div>Please authenticate to both Bluesky and Storacha to continue.</div>
  )
}