import Link from 'next/link'
import { styled } from 'next-yak'

import { Loader } from '@/components/Loader'
import { Box, Center, Stack, SubHeading } from '@/components/ui'
import { useSWR } from '@/lib/swr'
import { formatDate, shortenCID, shortenDID } from '@/lib/ui'
import { Backup } from '@/types'

import { CreateSnapshotButton } from './CreateSnapshotButton'

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
  padding: 1rem;
`

const SnapshotsLink = styled(Link)`
  display: block;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--color-dark-blue);
  font-family: var(--font-dm-mono);
  font-size: 0.75rem;
  color: var(--color-white);
  text-align: center;
`

export const RightSidebarContent = ({ backup }: { backup: Backup }) => {
  const { data: snapshots, isLoading } = useSWR([
    'api',
    `/api/backups/${backup.id}/snapshots`,
  ])

  return (
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
        <Stack $direction="row" $alignItems="center" $gap="1rem">
          <DetailName>Blobs</DetailName>
          <Link href={`/backups/${backup.id}/blobs`}>
            <DetailValue>View Blobs</DetailValue>
          </Link>
        </Stack>
      </Details>
      <SnapshotContainer $gap="1rem">
        <Stack $gap="0.5em" $direction="row" $alignItems="center">
          <CreateSnapshotButton backup={backup} />
          {snapshots && snapshots?.count > 5 && (
            <SnapshotsLink href={`/backups/${backup.id}/snapshots`}>
              All Snapshots
            </SnapshotsLink>
          )}
        </Stack>
        <SubHeading>Recent Snapshots</SubHeading>
        <Stack $gap="0.6rem">
          {isLoading ? (
            <Center $height="200px">
              <Loader />
            </Center>
          ) : (
            <>
              {snapshots?.results.slice(0, 5).map((snapshot) => (
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
        </Stack>
      </SnapshotContainer>
    </>
  )
}
