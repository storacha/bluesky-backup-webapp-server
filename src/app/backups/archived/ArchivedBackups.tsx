'use client'

import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { styled } from 'next-yak'
import { MouseEvent, useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { AppLayout } from '@/app/AppLayout'
import { BackButton } from '@/components/BackButton'
import { PaginationControls } from '@/components/Pagination'
import {
  Button,
  Heading,
  Stack,
  StatefulButton,
  SubHeading,
} from '@/components/ui'
import { PAGINATED_RESULTS_LIMIT } from '@/lib/constants'
import { useSWR } from '@/lib/swr'
import { shortenIfOver } from '@/lib/ui'
import { Backup, State } from '@/types'

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
  const { data: archivedBackups, error } = useSWR([
    'api',
    '/api/backups/archived',
    { page: pageNumber.toString() },
  ])

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
  const [state, setState] = useState<State>('idle')
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)

  const unarchiveBackup = async (e: MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const found = backups.find((backup) => backup.id === id)
    if (!found) return
    setSelectedBackup(found)

    try {
      setState('loading')
      const request = await fetch(`/api/backups/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: false }),
      })

      if (request.ok) {
        toast.success('Backup unarchived!')
        mutate(['api', '/api/backups'])
        mutate(['api', '/api/backups/archived'])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setState('idle')
    }
  }

  // when people try to see the details of an archived backup
  // we should give them the opportunity to do that separately, instead of
  // updating the location history
  const openArchivedBackup = (backupId: string) => {
    if (typeof window !== 'undefined')
      window.open(`/backups/${backupId}`, '__blank')
  }

  return (
    <Stack $gap="0.8rem">
      {backups.map((backup) => {
        return (
          <BackupCard key={backup.id}>
            <Stack
              $justifyContent="space-between"
              $direction="row"
              $alignItems="center"
            >
              <SubHeading>{shortenIfOver(backup.name)}</SubHeading>
              <Stack $direction="row">
                <Button
                  $background="none"
                  onClick={() => openArchivedBackup(backup.id)}
                >
                  <ArrowUpRightIcon color="var(--color-gray-medium)" />
                </Button>
                <StatefulButton
                  $fontSize="0.75rem"
                  $gap="1rem"
                  isLoading={
                    state === 'loading' && selectedBackup?.id === backup.id
                  }
                  disabled={
                    state === 'loading' && selectedBackup?.id === backup.id
                  }
                  onClick={(e) => unarchiveBackup(e, backup.id)}
                >
                  Unarchive
                </StatefulButton>
              </Stack>
            </Stack>
          </BackupCard>
        )
      })}
    </Stack>
  )
}
