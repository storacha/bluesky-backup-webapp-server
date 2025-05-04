'use client'
import { useEffect } from 'react'

import { Sidebar } from '@/app/Sidebar'
import { useSWR } from '@/app/swr'
import {
  DetailName,
  DetailValue,
} from '@/components/SnapshotScreen/SnapshotDetail'
import { Box, Stack } from '@/components/ui'
import { useRepo } from '@/hooks/use-repo'
import { GATEWAY_HOSTNAME } from '@/lib/constants'

export default function RepoPage({ id }: { id: string }) {
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])

  const { repo, loading } = useRepo({
    did: snapshot?.atprotoAccount || ''
  })

  useEffect(() => {
    if (snapshot?.atprotoAccount) {
      console.log('Snapshot loaded with atprotoAccount:', snapshot.atprotoAccount)
    }
  }, [snapshot])

  useEffect(() => {
    console.log('Current repo state:', {
      postsCount: repo.posts.length,
      likesCount: repo.likes.length,
      followsCount: repo.follows.length,
      loading
    })
  }, [repo, loading])

  if (error) throw error
  if (!snapshot) return null

  const url = `https://${snapshot.repositoryCid}.${GATEWAY_HOSTNAME}`

  return (
    <>
      <Sidebar selectedBackupId={null} />
      <Box $padding="2rem">
        <Stack>
          <DetailName>Gateway URL</DetailName>
          <DetailValue>
            <a target="_blank" href={url}>
              {url}
            </a>
          </DetailValue>
        </Stack>

        {loading ? (
          <p>Loading repository data...</p>
        ) : (
          <Stack>
            <DetailName>Repository Stats</DetailName>
            <DetailValue>
              <p>Posts: {repo.posts.length}</p>
              <p>Likes: {repo.likes.length}</p>
              <p>Follows: {repo.follows.length}</p>
            </DetailValue>
          </Stack>
        )}
      </Box>
    </>
  )
}
