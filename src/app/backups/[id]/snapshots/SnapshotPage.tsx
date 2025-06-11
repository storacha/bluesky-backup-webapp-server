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
import { PaginatedResult, Snapshot } from '@/types'

const SnapshotContainer = styled(Stack)`
  margin: 2rem;
`

const SnapshotSummary = styled(Box)`
  padding: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const SnapshotLink = styled(Link)`
  display: block;
  font-family: var(--font-dm-mono);
  font-size: 1rem;
  text-align: center;
`

interface SnapshotPageProps {
  backupId: string
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
      {loading ? (
        <Center $height="200px">
          <Loader />
        </Center>
      ) : (
        <>
          {snapshots?.map((snapshot) => (
            <SnapshotSummary key={snapshot.id} $background="var(--color-white)">
              <SnapshotLink href={`/snapshots/${snapshot.id}`}>
                {formatDate(snapshot.createdAt)}
              </SnapshotLink>
            </SnapshotSummary>
          ))}
        </>
      )}
    </SnapshotContainer>
  )
}

export default function SnapshotPage({
  backupId,
}: Pick<SnapshotPageProps, 'backupId'>) {
  const [pageNumber, setPageNumber] = useState(1)

  const { data, isLoading } = useSWR([
    'api',
    `/api/backups/${backupId}/snapshots`,
    { page: pageNumber.toString() },
  ])
  // TODO: remove this cast once Fetchable no longer gets confused
  const snapshots = data as PaginatedResult<Snapshot>
  const totalPages =
    snapshots && Math.ceil(snapshots?.count / PAGINATED_RESULTS_LIMIT)

  if (!snapshots) return null

  return (
    <AppLayout selectedBackupId={backupId}>
      <Stack $gap="0.8rem">
        <Snapshots
          backupId={backupId}
          loading={isLoading}
          snapshots={snapshots?.results || []}
        />
        <PaginationControls
          totalPages={totalPages ?? 1}
          currentPage={pageNumber}
          onChange={(newPage) => setPageNumber(newPage)}
        />
      </Stack>
    </AppLayout>
  )
}
