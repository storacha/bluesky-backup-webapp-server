'use client'
import { Did } from '@atproto/api'
import Link from 'next/link'

import { Sidebar } from '@/app/Sidebar'
import { Posts } from '@/components/Posts'
import { Box, Heading, NoTextTransform, Stack } from '@/components/ui'
import { useProfile } from '@/hooks/use-profile'
import { useRepo } from '@/hooks/use-repo'
import { useSWR } from '@/lib/swr'

export default function RepoPage({ id }: { id: string }) {
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])

  const { repo, loading } = useRepo({
    cid: snapshot?.repositoryCid || '',
  })
  const { data: profile } = useProfile(snapshot?.atprotoAccount as Did)

  if (error) throw error
  if (!snapshot) return null

  return (
    <>
      <Sidebar selectedBackupId={null} />
      <Box $padding="2rem" $borderStyle="none" $height="100%">
        {loading ? (
          <p>Loading repository data...</p>
        ) : (
          <Stack $gap=".8rem">
            <Heading>
              Recent Posts
              {profile && (
                <>
                  {' '}
                  from{' '}
                  <Link
                    href={`https://bsky.app/profile/${profile?.handle}`}
                    target="_blank"
                  >
                    <NoTextTransform>@{profile?.handle}</NoTextTransform>
                  </Link>
                </>
              )}{' '}
              In This Snapshot
            </Heading>
            <Posts
              repositoryDid={snapshot.atprotoAccount}
              posts={repo.posts.slice(0, 20)}
            />
          </Stack>
        )}
      </Box>
    </>
  )
}
