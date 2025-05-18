'use client'

import Link from 'next/link'
import { styled } from 'next-yak'
import { useState } from 'react'

import { AppLayout } from '@/app/AppLayout'
import { BackButton } from '@/components/BackButton'
import { Loader } from '@/components/Loader'
import { PaginationControls } from '@/components/Pagination'
import { Box, Center, Heading, Stack } from '@/components/ui'
import { PAGINATED_RESULTS_LIMIT } from '@/lib/constants'
import { useSWR } from '@/lib/swr'
import { formatDate } from '@/lib/ui'
import { Snapshot } from '@/types'

const SnapshotContainer = styled(Stack)`
  margin: 2rem;
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

interface SnapshotPageProps {
  backupId: string
  pageNumber: number
  snapshots: Snapshot[]
  loading: boolean
}

function Snapshots({ snapshots, loading, backupId }: SnapshotPageProps) {
  return (
    <SnapshotContainer $gap="1rem">
      <Stack $direction="row" $gap="1rem">
        <BackButton path={`/backups/${backupId}`} />
        <Heading>Snapshots</Heading>
      </Stack>
      <>
        {loading ? (
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
  )
}

export default function SnapshotPage({
  backupId,
}: Pick<SnapshotPageProps, 'backupId'>) {
  const [pageNumber, setPageNumber] = useState(1)

  const { data: snapshots, isLoading } = useSWR([
    'api',
    `/api/backups/${backupId}/snapshots`,
    { page: pageNumber.toString() },
  ])

  const totalPages =
    snapshots && Math.ceil(snapshots?.count / PAGINATED_RESULTS_LIMIT)

  return (
    <AppLayout selectedBackupId={backupId}>
      <Stack $gap="0.8rem">
        <Snapshots
          backupId={backupId}
          pageNumber={pageNumber}
          loading={isLoading}
          snapshots={snapshots?.results as Snapshot[]}
        />
        <PaginationControls
          totalPages={totalPages ?? 1}
          currentPage={pageNumber}
          onChange={(newPage) => setPageNumber(newPage)}
        />
        <div style={{ display: 'none' }}>
          <Snapshots
            backupId={backupId}
            pageNumber={pageNumber}
            loading={isLoading}
            snapshots={snapshots?.results as Snapshot[]}
          />
        </div>
      </Stack>
    </AppLayout>
  )
}
