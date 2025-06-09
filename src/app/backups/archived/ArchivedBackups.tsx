'use client'

import Link from 'next/link'
import { styled } from 'next-yak'
import { useState } from 'react'

import { AppLayout } from '@/app/AppLayout'
import { BackButton } from '@/components/BackButton'
import { PaginationControls } from '@/components/Pagination'
import { Heading, Stack, SubHeading } from '@/components/ui'
import { PAGINATED_RESULTS_LIMIT } from '@/lib/constants'
import { useSWR } from '@/lib/swr'
import { Backup, PaginatedResult } from '@/types'

const ArchivedBackupsWrapper = styled(Stack)`
  padding: 2rem;
  width: 38%;

  @media only screen and (min-width: 0px) and (max-width: 600px) {
    width: 100%;
  }

  @media only screen and (min-width: 601px) and (max-width: 1024px) {
    width: 55%;
  }
`

const BackupCard = styled.div`
  width: 100%;
  height: fit-content;
  border-radius: 0.6rem;
  background: var(--color-white);
  padding: 1rem 0.8rem;
  align-content: center;
  align-items: center;
`

export default function ArchivedBackupsPage() {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const { data, error } = useSWR([
    'api',
    '/api/backups/archived',
    { page: pageNumber.toString() },
  ])
  const archivedBackups = data as PaginatedResult<Backup>

  const totalPages =
    archivedBackups &&
    Math.ceil(archivedBackups?.count / PAGINATED_RESULTS_LIMIT)
  if (error) throw error
  if (!archivedBackups) return null

  return (
    <AppLayout selectedBackupId={null}>
      <ArchivedBackupsWrapper $gap="1rem">
        <Stack $direction="row" $gap="1rem">
          <BackButton path="/" />
          <Heading>Archived Backups</Heading>
        </Stack>
        <Backups backups={archivedBackups?.results || []} />
        <PaginationControls
          totalPages={totalPages ?? 1}
          currentPage={pageNumber}
          onChange={(newPage) => setPageNumber(newPage)}
        />
      </ArchivedBackupsWrapper>
    </AppLayout>
  )
}

const Backups = ({ backups }: { backups: Backup[] }) => {
  return (
    <Stack $gap="0.8rem">
      {backups.map((backup) => {
        return (
          <Link href={`/backups/${backup.id}`} key={backup.id}>
            <BackupCard>
              <Stack
                $justifyContent="space-between"
                $direction="row"
                $alignItems="center"
              >
                <SubHeading>{backup.name}</SubHeading>
              </Stack>
            </BackupCard>
          </Link>
        )
      })}
    </Stack>
  )
}
