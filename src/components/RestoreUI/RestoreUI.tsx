'use client'

import { Agent, CredentialSession } from '@atproto/api'
import { useState } from 'react'
import useSWR from 'swr'

import { ATPROTO_DEFAULT_SINK } from '@/lib/constants'
import { loadCid } from '@/lib/storacha'
import {
  ATBlob,
  atBlobPaginatedResultSchema,
  PaginatedResult,
  Snapshot,
} from '@/types'

import { Box } from '../ui'
import { LoginFn } from '../ui/atproto'

import { Repo, RestoreDialogView } from './RestoreDialogView'

async function* blobsAtUrl(url: string): AsyncGenerator<ATBlob> {
  const result = await fetch(url)
  const page = atBlobPaginatedResultSchema.parse(await result.json())
  yield* page.results
  if (page.next) yield* blobsAtUrl(page.next)
}

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
  const snapshotBlobsUrl = `/api/snapshots/${snapshotId}/blobs`
  const { data: snapshotBlobData } = useSWR<ATBlob[]>(['api', snapshotBlobsUrl])
  // TODO remove once we fix fetcher
  const snapshotBlobResult = snapshotBlobData as
    | PaginatedResult<ATBlob>
    | undefined

  const backupBlobsUrl = `/api/backups/${snapshot?.backupId}/blobs`
  const { data: backupBlobData } = useSWR<ATBlob[]>(['api', backupBlobsUrl])
  // TODO remove once we fix fetcher
  const backupBlobResult = backupBlobData as PaginatedResult<ATBlob> | undefined

  const [isRestoringRepo, setIsRestoringRepo] = useState<boolean>(false)
  const [isRepoRestored, setIsRepoRestored] = useState<boolean>(false)

  const [isRestoringSnapshotBlobs, setIsRestoringSnapshotBlobs] =
    useState<boolean>(false)
  const [areSnapshotBlobsRestored, setAreSnapshotBlobsRestored] =
    useState<boolean>(false)

  const [areBackupBlobsRestored, setAreBackupBlobsRestored] =
    useState<boolean>(false)
  const [isRestoringBackupBlobs, setIsRestoringBackupBlobs] =
    useState<boolean>(false)

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

  async function restoreBlobs(blobs: AsyncIterable<ATBlob>) {
    if (sinkAgent) {
      for await (const blob of blobs) {
        console.log('restoring blob', blob.cid)
        await sinkAgent.com.atproto.repo.uploadBlob(
          new Uint8Array(await loadCid(blob.cid)),
          {
            encoding: blob.contentType,
          }
        )
      }
    } else {
      console.warn('not restoring:', blobs, sinkAgent)
    }
  }

  async function restoreSnapshotBlobs() {
    try {
      setIsRestoringSnapshotBlobs(true)
      await restoreBlobs(blobsAtUrl(snapshotBlobsUrl))

      setAreSnapshotBlobsRestored(true)
    } finally {
      setIsRestoringSnapshotBlobs(false)
    }
  }

  async function restoreBackupBlobs() {
    try {
      setIsRestoringBackupBlobs(true)
      await restoreBlobs(blobsAtUrl(backupBlobsUrl))

      setAreBackupBlobsRestored(true)
    } finally {
      setIsRestoringBackupBlobs(false)
    }
  }

  return (
    <Box $padding="16px">
      <RestoreDialogView
        sinkSession={sinkSession}
        loginToSink={loginToSink}
        restoreRepo={restoreRepo}
        restoreSnapshotBlobs={restoreSnapshotBlobs}
        restoreBackupBlobs={restoreBackupBlobs}
        repo={repo}
        isRestoringRepo={isRestoringRepo}
        isRepoRestored={isRepoRestored}
        snapshotBlobsCount={snapshotBlobResult?.count}
        isRestoringSnapshotBlobs={isRestoringSnapshotBlobs}
        areSnapshotBlobsRestored={areSnapshotBlobsRestored}
        backupBlobsCount={backupBlobResult?.count}
        isRestoringBackupBlobs={isRestoringBackupBlobs}
        areBackupBlobsRestored={areBackupBlobsRestored}
      />
    </Box>
  )
}
