'use client'

import { Agent, CredentialSession } from '@atproto/api'
import { useState } from 'react'
import useSWR from 'swr'

import { ATPROTO_DEFAULT_SINK } from '@/lib/constants'
import { loadCid } from '@/lib/storacha'
import { ATBlob, Snapshot } from '@/types'

import { Box } from '../ui'
import { LoginFn } from '../ui/atproto'

import { Repo, RestoreDialogView } from './RestoreDialogView'

export default function RestoreDialog({ snapshotId }: { snapshotId: string }) {
  const { data: snapshot } = useSWR<Snapshot>([
    'api',
    `/api/snapshots/${snapshotId}`,
  ])
  const repo: Repo | undefined = snapshot?.repositoryCid
    ? {
        cid: snapshot.repositoryCid,
        accountDid: snapshot.atprotoAccount,
        createdAt: new Date(snapshot.createdAt),
      }
    : undefined
  const { data: blobs } = useSWR<ATBlob[]>([
    'api',
    `/api/snapshots/${snapshotId}/blobs`,
  ])

  const [isRestoringRepo, setIsRestoringRepo] = useState<boolean>(false)
  const [isRestoringBlobs, setIsRestoringBlobs] = useState<boolean>(false)

  const [isRepoRestored, setIsRepoRestored] = useState<boolean>(false)
  const [areBlobsRestored, setAreBlobsRestored] = useState<boolean>(false)

  const [sinkSession, setSinkSession] = useState<CredentialSession>()
  const [sinkAgent, setSinkAgent] = useState<Agent>()

  const loginToSink: LoginFn = async (
    identifier,
    password,
    { server = ATPROTO_DEFAULT_SINK } = { server: ATPROTO_DEFAULT_SINK }
  ) => {
    const session = new CredentialSession(new URL(server))
    await session.login({ identifier, password })
    const agent = new Agent(session)
    setSinkSession(session)
    setSinkAgent(agent)
  }

  async function restoreRepo() {
    if (repo && sinkAgent) {
      setIsRestoringRepo(true)
      console.log('restoring repo', repo.cid)
      await sinkAgent.com.atproto.repo.importRepo(
        new Uint8Array(await loadCid(repo.cid, repo.encryptedWith)),
        {
          encoding: 'application/vnd.ipld.car',
        }
      )
      setIsRestoringRepo(false)
      setIsRepoRestored(true)
    } else {
      console.warn('not restoring:', repo, sinkAgent)
    }
  }

  async function restoreBlobs() {
    if (blobs && sinkAgent) {
      setIsRestoringBlobs(true)
      for (const blob of blobs) {
        console.log('restoring blob', blob.cid)
        await sinkAgent.com.atproto.repo.uploadBlob(
          new Uint8Array(await loadCid(blob.cid)),
          {
            encoding: blob.contentType,
          }
        )
      }
      setIsRestoringBlobs(false)
      setAreBlobsRestored(true)
    } else {
      console.warn('not restoring:', blobs, sinkAgent)
    }
  }

  return (
    <Box $padding="16px">
      <RestoreDialogView
        sinkSession={sinkSession}
        loginToSink={loginToSink}
        restoreRepo={restoreRepo}
        restoreBlobs={restoreBlobs}
        repo={repo}
        blobs={blobs}
        isRestoringRepo={isRestoringRepo}
        isRestoringBlobs={isRestoringBlobs}
        isRepoRestored={isRepoRestored}
        areBlobsRestored={areBlobsRestored}
      />
    </Box>
  )
}
