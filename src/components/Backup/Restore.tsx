import { styled } from 'next-yak'
import { Box, Container, Heading, SubHeading } from './Backup'
import { ButtonLink, Center, Stack, Text } from '../ui'
import { Backup, BackupConfig } from '@/app/types'
import useSWR from 'swr'
import { formatDate, shortenDID } from '@/lib/ui'

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
`

const Instruction = styled(Text)``

const Snapshot = styled(Stack)`
margin-top: 4rem;
`

const Details = styled(Stack)`
margin-top: 4rem;
`

const DetailName = styled(SubHeading)`
color: black;
`

const DetailValue = styled.div`
font-family: var(--font-dm-mono);
font-size: 0.75rem;
`

const SnapshotSummary = styled(Box)`
font-size: 0.75rem;
`

export interface BackupRestoreProps {
  config?: BackupConfig
}

export const BackupRestore = ({ config }: BackupRestoreProps) => {
  const { data: snapshots } = useSWR<Backup[]>(config && [
    'api',
    `/api/backup-configs/${config.id}/backups`,
  ])

  return (
    <RestoreContainer>
      <Heading>backup & restore</Heading>
      {config ? (
        <>
          <Details $gap='1rem'>
            <SubHeading>Details</SubHeading>
            <Stack $direction='row' $alignItems='center' $gap='1rem'>
              <DetailName>Account DID</DetailName>
              <DetailValue>
                {shortenDID(config.atprotoAccount)}
              </DetailValue>
            </Stack>
          </Details>
          <Snapshot $gap='1rem'>
            <SubHeading>Snapshots</SubHeading>
            {snapshots?.map(snapshot => (
              <SnapshotSummary key={snapshot.id} $background='var(--color-white)'>
                <Stack $direction='row' $alignItems='center' $justifyContent='space-between' $width='100%'>
                  <Stack $direction='column' $alignItems='flex-start'>
                    <h3>Snapshot {snapshot.id}</h3>
                    <h3>{formatDate(snapshot.createdAt)}</h3>
                  </Stack>
                  <ButtonLink
                        $background="var(--color-white)"
                        $color="var(--color-black)"
                        $textTransform="capitalize"
                        $width="fit-content"
                        $fontSize="0.75rem"
                   href={`/snapshots/${snapshot.id}`}
                   >
                    View
                  </ButtonLink>
                </Stack>
              </SnapshotSummary>
            ))}
          </Snapshot>
        </>
      ) : (
        <Center $height="90vh">
          <Instruction $fontWeight="600">
            Press &quot;Create Backup&quot; to get started!
          </Instruction>
        </Center>
      )}
    </RestoreContainer>
  )
}
