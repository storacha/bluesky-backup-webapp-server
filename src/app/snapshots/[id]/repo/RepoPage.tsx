'use client'
import { Sidebar } from '@/app/Sidebar'
import { Posts } from '@/components/Posts'
import { DetailName } from '@/components/SnapshotScreen/SnapshotDetail'
import { Box, Stack } from '@/components/ui'
import { useRepo } from '@/hooks/use-repo'
import { useSWR } from '@/lib/swr'

export default function RepoPage({ id }: { id: string }) {
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])

  const { repo, loading } = useRepo({
    cid: snapshot?.repositoryCid || '',
  })

  if (error) throw error
  if (!snapshot) return null

  return (
    <>
      <Sidebar selectedBackupId={null} />
      <Box $padding="2rem" $borderStyle="none" $height="100%">
        {loading ? (
          <p>Loading repository data...</p>
        ) : (
          <Stack>
            <DetailName>Repository Stats</DetailName>
            <Posts repositoryDid={snapshot.atprotoAccount} posts={repo.posts} />
          </Stack>
        )}
      </Box>
    </>
  )
}
