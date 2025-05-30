'use client'
import { styled } from 'next-yak'

import { AppLayout } from '@/app/AppLayout'
import { BackButton } from '@/components/BackButton'
import { Heading, Stack, Text } from '@/components/ui'
import { useSWR } from '@/lib/swr'

const ArchivedBackupsWrapper = styled(Stack)`
  padding: 2rem;
`

export default function ArchivedBackupsPage() {
  const { data: archivedBackups } = useSWR(['api', '/api/backups/archived'])
  console.log('archived backup', archivedBackups)

  return (
    <AppLayout selectedBackupId={null}>
      <ArchivedBackupsWrapper $gap="1rem">
        <Stack $direction="row" $gap="1rem">
          <BackButton path="/" />
          <Heading>Archived Backups</Heading>
        </Stack>

        <Text>Backup archiv stuff</Text>
      </ArchivedBackupsWrapper>
    </AppLayout>
  )
}
