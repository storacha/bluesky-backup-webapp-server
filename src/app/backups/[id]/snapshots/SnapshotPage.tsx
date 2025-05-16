'use client'

import Link from 'next/link'
import { styled } from 'next-yak'

import { AppLayout } from '@/app/AppLayout'
import { Loader } from '@/components/Loader'
import { Box, Center, Heading, Stack } from '@/components/ui'
import { useSWR } from '@/lib/swr'
import { formatDate } from '@/lib/ui'

const SnapshotContainer = styled(Stack)`
  margin: 4rem;
`

const SnapshotSummary = styled(Box)`
  padding: 1rem;
  font-size: 0.75rem;
`

const SnapshotLink = styled(Link)`
  width: 100%;
  height: 100%;
  padding: 1rem;
`

export default function SnapshotPage ({ backupId }: { backupId: string }) {
  const { data: snapshots, isLoading } = useSWR([
    'api',
    `/api/backups/${backupId}/snapshots`,
  ])

  return (
    <AppLayout selectedBackupId={backupId}>
        <SnapshotContainer $gap="1rem">
          <Heading>Snapshots</Heading>
          <>
            {isLoading ? (
              <Center $height="200px">
                <Loader />
              </Center>
            ) : (
              <>
                {snapshots?.map((snapshot) => (
                  <SnapshotSummary
                    key={snapshot.id}
                    $background="var(--color-white)"
                  >
                    <SnapshotLink href={`/snapshots/${snapshot.id}`}>
                      <Stack
                        $direction="row"
                        $alignItems="center"
                        $justifyContent="space-between"
                        $width="100%"
                      >
                        <Stack $direction="column" $alignItems="flex-start">
                          <h3>{formatDate(snapshot.createdAt)} Snapshot</h3>
                        </Stack>
                      </Stack>
                    </SnapshotLink>
                  </SnapshotSummary>
                ))}
              </>
            )}
          </>
        </SnapshotContainer>
    </AppLayout>
  )
}
