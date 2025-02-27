'use client'

import { useBskyAuthContext } from "@/contexts"
import { backup } from "@/lib/bluesky"
import { Space, useW3 } from "@w3ui/react"
import { useState } from "react"
import { SpaceFinder } from "./SpaceFinder"

export default function BackupButton () {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [spaceDid, setSpaceDid] = useState<Space>()
  const [storacha] = useW3()
  const bluesky = useBskyAuthContext()
  async function onClick () {
    if (spaceDid && bluesky.userProfile && bluesky.agent && storacha.client) {
      await storacha.client.setCurrentSpace(spaceDid.did())

      setIsBackingUp(true)
      await backup(bluesky.userProfile, bluesky.agent, storacha.client)
      setIsBackingUp(false)
    } else {
      console.log(bluesky.userProfile, bluesky.agent, storacha.client)
    }
  }
  const userAuthenticatedToBothServices = bluesky.userProfile && (storacha.accounts.length > 0)
  return userAuthenticatedToBothServices ? (

    isBackingUp ? (
      <div>
        Backup In Progress! Please check the developer console to see progress.
      </div>
    ) : (
      <div>
        <SpaceFinder selected={spaceDid} setSelected={setSpaceDid} spaces={storacha.spaces} />
        <button onClick={onClick} disabled={!spaceDid}>
          {spaceDid ? "Back It Up!" : "Please Pick a Space"}
        </button>
      </div>
    )
  ) : (
    <div>Please authenticate to both Bluesky and Storacha to continue.</div>
  )
}