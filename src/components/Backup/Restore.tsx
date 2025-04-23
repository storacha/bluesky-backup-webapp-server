import { styled } from 'next-yak'
import { Box, Container, Heading, SubHeading } from './Backup'
import { Button, Center, Modal, Stack, Text } from '../ui'
import { Snapshot, Backup } from '@/app/types'
import useSWR from 'swr'
import { formatDate, shortenDID } from '@/lib/ui'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useState } from 'react'

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
`

const Instruction = styled(Text)``

const SnapshotContainer = styled(Stack)`
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
  config?: Backup
}

export const BackupRestore = ({ config }: BackupRestoreProps) => {
  const { data: snapshots } = useSWR<Snapshot[]>(config && [
    'api',
    `/api/backups/${config.id}/snapshots`,
  ])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot>()
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
          <SnapshotContainer $gap='1rem'>
            <SubHeading>Snapshots</SubHeading>
            {snapshots?.map(snapshot => (
              <SnapshotSummary key={snapshot.id} $background='var(--color-white)'>
                <Stack $direction='row' $alignItems='center' $justifyContent='space-between' $width='100%'>
                  <Stack $direction='column' $alignItems='flex-start'>
                    <h3>Snapshot {snapshot.id}</h3>
                    <h3>{formatDate(snapshot.createdAt)}</h3>
                  </Stack>
                  <Button
                    $background="var(--color-white)"
                    $color="var(--color-black)"
                    $textTransform="capitalize"
                    $width="fit-content"
                    $fontSize="0.75rem"
                    onClick={() => {
                      setSelectedSnapshot(snapshot);
                      onOpen();
                    }}
                  >
                    View
                  </Button>
                </Stack>
              </SnapshotSummary>
            ))}
          </SnapshotContainer>
          {selectedSnapshot && (
            <Modal isOpen={isOpen} onClose={onClose}>
              <Box $height='80%' $width='80%'>
                <SnapshotDetail snapshot={selectedSnapshot} />
              </Box>
            </Modal>
          )}
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

function SnapshotDetail ({ snapshot }: { snapshot: Snapshot }) {
  return (
    <Stack $direction='row' $alignItems='center' $justifyContent='between'>
      <Stack $direction='column' $alignItems='flex-start'>
        <h3>Snapshot {snapshot.id}</h3>
        <h3>{formatDate(snapshot.createdAt)}</h3>
      </Stack>
      <Stack $direction='column' $alignItems='flex-start'>
        <Box>
          <Stack $direction='row'>
            Repository
          </Stack>
          <Stack $direction='row'>
            <Button>View</Button>
            <Button>Restore</Button>
          </Stack>
        </Box>
        <Box>
          <Stack $direction='row'>
            Blobs
          </Stack>
          <Stack $direction='row'>
            <Button>View</Button>
            <Button>Restore</Button>
          </Stack>
        </Box>
        <Box>
          <Stack $direction='row'>
            Preferences
          </Stack>
          <Stack $direction='row'>
            <Button>View</Button>
            <Button>Restore</Button>
          </Stack>
        </Box>
        <Stack $direction='row'>
          <Button>View all</Button>
          <Button>Restore all</Button>
        </Stack>
      </Stack>
    </Stack>
  )
}