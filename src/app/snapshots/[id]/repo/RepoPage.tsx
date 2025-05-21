'use client'
import { Did } from '@atproto/api'
import Link from 'next/link'

import { AppLayout } from '@/app/AppLayout'
import { BackButton } from '@/components/BackButton'
import { Loader } from '@/components/Loader'
import { Posts } from '@/components/Posts'
import { Box, Center, Heading, NoTextTransform, Stack } from '@/components/ui'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { useProfile } from '@/hooks/use-profile'
import { useRepo } from '@/hooks/use-repo'
import { useSWR } from '@/lib/swr'

export default function RepoPage({ id }: { id: string }) {
  const { isMobile, isTablet } = useMobileScreens()
  const { data: snapshot, error } = useSWR(['api', `/api/snapshots/${id}`])

  const { repo, loading } = useRepo({
    cid: snapshot?.repositoryCid || '',
  })
  const { data: profile } = useProfile(snapshot?.atprotoAccount as Did)

  if (error) throw error
  if (!snapshot) return null

  return (
    <AppLayout selectedBackupId={snapshot.backupId}>
      <Box $padding={isMobile ? "1rem" : "2rem"} $borderStyle="none" $height="100%">
        {loading ? (
          <Center $height="80vh">
            <Loader />
          </Center>
        ) : (
          <Stack
            $gap="1rem"
            $width={isMobile ? '100%' : isTablet ? '60%' : '35%'}
          >
            <BackButton path={`/snapshots/${id}`} />
            <Stack $gap=".8rem" $width="100%">
              <Heading>
                Recent Posts
                {profile && (
                  <>
                    {' '}
                    from{' '}
                    <Link
                      href={`https://bsky.app/profile/${profile.handle}`}
                      target="_blank"
                    >
                      <NoTextTransform>@{profile.handle}</NoTextTransform>
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
          </Stack>
        )}
      </Box>
    </AppLayout>
  )
}
