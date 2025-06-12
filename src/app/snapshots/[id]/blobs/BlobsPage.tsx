'use client'

import { useState } from 'react'

import { AppLayout } from '@/app/AppLayout'
import { Blobs } from '@/components/Blobs'
import { PaginationControls } from '@/components/Pagination'
import { Center, Stack } from '@/components/ui'
import { PAGINATED_RESULTS_LIMIT } from '@/lib/constants'
import { useSWR } from '@/lib/swr'
import { ATBlob, PaginatedResult } from '@/types'

export default function BlobsPage({ id }: { id: string }) {
  const [pageNumber, setPageNumber] = useState(1)
  const {
    data: blobs,
    error,
    isLoading,
  } = useSWR([
    'api',
    `/api/snapshots/${id}/blobs`,
    { page: pageNumber.toString() },
  ])
  // TS can't different the keys in the Fetchable tuple since
  // /api/snapshots/${id} and /api/snapshots/${id}/blobs share a snimilar shape
  // hence my type assertion here
  const paginatedBlobs = blobs as PaginatedResult<ATBlob>
  const totalPages =
    blobs && Math.ceil(paginatedBlobs.count / PAGINATED_RESULTS_LIMIT)
  if (error) throw error
  if (!blobs) return null

  return (
    <AppLayout
      selectedBackupId={paginatedBlobs?.results?.[0]?.backupId || null}
    >
      <Stack $gap="0.8rem">
        <Blobs
          blobs={paginatedBlobs?.results}
          backPath={`/snapshots/${id}`}
          loading={isLoading}
          location="Snapshot"
        />
        <Center>
          <PaginationControls
            totalPages={totalPages ?? 1}
            currentPage={pageNumber}
            onChange={(newPage) => setPageNumber(newPage)}
          />
        </Center>
      </Stack>
    </AppLayout>
  )
}
