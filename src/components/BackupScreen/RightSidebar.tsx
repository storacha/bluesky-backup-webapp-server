import Link from 'next/link'
import { styled } from 'next-yak'
import useSWR from 'swr'

import { Backup, Snapshot } from '@/app/types'
import { formatDate, shortenCID, shortenDID } from '@/lib/ui'

import { Box, Center, Container, Heading, Stack, SubHeading, Text } from '../ui'

const SidebarContainer = styled(Container)`
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
  padding: 1rem;
  font-size: 0.75rem;
`

const SnapshotLink = styled(Link)`
  width: 100%;
  height: 100%;
`

interface SidebarProps {
  backup?: Backup
}

const Sidebar = ({ backup }: SidebarProps) => {
  const { data: snapshots } = useSWR<Snapshot[]>(
    backup && ['api', `/api/backups/${backup.id}/snapshots`]
  )

  return (
    <SidebarContainer>
      <Heading>backup & restore</Heading>
      {backup ? (
        <>
          <Details $gap="1rem">
            <SubHeading>Details</SubHeading>
            <Stack $direction="row" $alignItems="center" $gap="1rem">
              <DetailName>Account DID</DetailName>
              <DetailValue>{shortenDID(backup.atprotoAccount)}</DetailValue>
            </Stack>
            <Stack $direction="row" $alignItems="center" $gap="1rem">
              <DetailName>Delegation CID</DetailName>
              <DetailValue>
                {backup.delegationCid
                  ? shortenCID(backup.delegationCid)
                  : 'No delegation set'}
              </DetailValue>
            </Stack>
          </Details>
          <SnapshotContainer $gap="1rem">
            <SubHeading>Snapshots</SubHeading>
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
          </SnapshotContainer>
        </>
      ) : (
        <Center $height="90vh">
          <Instruction $fontWeight="600">
            Press &quot;Create Snapshot&quot; to get started!
          </Instruction>
        </Center>
      )}
    </SidebarContainer>
  )
}

export default Sidebar
