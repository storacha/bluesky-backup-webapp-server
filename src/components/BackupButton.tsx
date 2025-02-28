'use client'

import { useBskyAuthContext } from "@/contexts"
import { backup, BackupMetadataStore } from "@/lib/bluesky"
import { Space, useW3 } from "@w3ui/react"
import { useState } from "react"
import { SpaceFinder } from "./SpaceFinder"
import db from "@/app/db"

const backupMetadataStore: BackupMetadataStore = {
  async setLatestCommit (accountDid, commitRev) {
    await db.commits.put({ accountDid, commitRev })
  },
  async addRepo (cid, backupId, accountDid) {
    await db.repos.put({ cid, backupId, accountDid })
  },
  async addBlob (cid, backupId, accountDid) {
    await db.blobs.put({ cid, backupId, accountDid })
  },
  async addBackup (accountDid) {
    return await db.backups.add({ accountDid, createdAt: new Date() })
  }
}

export interface BackupButtonProps {
  backupMetadataStore: BackupMetadataStore
}

export default function BackupButton () {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<Space>()
  const [storacha] = useW3()
  const bluesky = useBskyAuthContext()
  const backupEvents = new EventTarget()
  const space = selectedSpace ?? storacha?.spaces[0]
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
  const userAuthenticatedToBothServices = bluesky.userProfile && (storacha.accounts.length > 0)
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
        Backup started...
      </>
    )
  })
  backupEvents.addEventListener('blob:fetching', (e) => {
    const { i: loaded, count: total } = (e as CustomEvent).detail ?? { i: 0, count: 1 }
    const percentComplete = Math.floor((loaded / total) * 100)
    setBackupProgressComponent(
      <div>
        <h3>Backing up your Bluesky account...</h3>
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
        <p>Please choose the Storacha space where you&apos;d like to back up your Bluesky account:</p>
        {storacha.spaces && (storacha.spaces.length > 0) && (
          <SpaceFinder
            selected={space} setSelected={setSelectedSpace} spaces={storacha.spaces}
            className="w-52" />
        )}
        <button
          onClick={onClick} disabled={!space}
          className="btn">
          {space ? "Back It Up!" : "Please Pick a Space"}
        </button>
      </div>
    )
  ) : (
    <div>Please authenticate to both Bluesky and Storacha to continue.</div>
  )
}