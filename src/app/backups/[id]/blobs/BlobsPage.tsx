'use client'

import { useState } from 'react'

import { AppLayout } from '@/app/AppLayout'
import { Blobs } from '@/components/Blobs'
import { PaginationControls } from '@/components/Pagination'
import { Center, Stack } from '@/components/ui'
import { PAGINATED_RESULTS_LIMIT } from '@/lib/constants'
import { useSWR } from '@/lib/swr'
import { ATBlob, PaginatedResult } from '@/types'

export default function AllBlobs({ backupId }: { backupId: string }) {
  const [pageNumber, setPageNumber] = useState(1)
  const { data, error, isLoading } = useSWR([
    'api',
    `/api/backups/${backupId}/blobs`,
    { page: pageNumber.toString() },
  ])
  // TODO: remove this cast when we fix the bug in Fetchable that makes it ambiguous
  const blobs = data as PaginatedResult<ATBlob>
  const totalPages = blobs && Math.ceil(blobs?.count / PAGINATED_RESULTS_LIMIT)
  if (error) throw error

  return (
    <AppLayout selectedBackupId={backupId}>
      <Stack $gap="0.8rem">
        <Blobs
          blobs={blobs?.results || []}
          backPath={`/backups/${backupId}`}
          loading={isLoading}
          location="Backup"
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
