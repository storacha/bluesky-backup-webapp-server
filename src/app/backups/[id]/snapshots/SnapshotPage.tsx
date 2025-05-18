'use client'

import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import Link from 'next/link'
import { styled } from 'next-yak'
import { useState } from 'react'

import { AppLayout } from '@/app/AppLayout'
import { Loader } from '@/components/Loader'
import { Box, Center, Heading, Stack } from '@/components/ui'
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

function Snapshots({ snapshots, loading }: SnapshotPageProps) {
  return (
    <SnapshotContainer $gap="1rem">
      <Heading>Snapshots</Heading>
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

const PaginationControls = styled.div`
  display: flex;
  gap: 1.4rem;
  padding: 0 2rem;
  align-items: center;
`

export default function SnapshotPage({
  backupId,
}: Pick<SnapshotPageProps, 'backupId'>) {
  const [pageNumber, setPageNumber] = useState(1)

  const { data: snapshots, isLoading } = useSWR([
    'api',
    `/api/backups/${backupId}/snapshots`,
    { page: pageNumber.toString() },
  ])

  const totalPages = snapshots && Math.ceil(snapshots?.count / 10)

  return (
    <AppLayout selectedBackupId={backupId}>
      <Stack $gap="0.8rem">
        <Snapshots
          backupId={backupId}
          pageNumber={pageNumber}
          loading={isLoading}
          snapshots={snapshots?.results as Snapshot[]}
        />
        <PaginationControls>
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber === 1}
          >
            <CaretLeft size={19} />
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {Array.from({ length: Number(totalPages) }, (_, index) => {
              return (
                <button
                  key={index}
                  onClick={() => setPageNumber(index + 1)}
                  style={{
                    color: index + 1 === pageNumber ? 'var(--color-dark-blue' : ''
                  }}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPageNumber((p) => p + 1)}
            disabled={pageNumber >= Number(totalPages)}
          >
            <CaretRight size={19} />
          </button>
        </PaginationControls>
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
