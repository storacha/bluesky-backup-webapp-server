import Link from 'next/link'
import { styled } from 'next-yak'

import { formatDate, shortenCID, shortenDID } from '@/lib/ui'
import { Snapshot } from '@/types'

import CopyButton from '../CopyButton'
import { Heading, Stack, SubHeading } from '../ui'

const Details = styled(Stack)`
  margin-top: 4rem;
  padding-left: 2rem;
`

export const DetailName = styled(SubHeading)`
  color: black;
`

const DetailValue = styled.div`
  font-family: var(--font-dm-mono);
  font-size: 0.75rem;
`

export interface SnapshotDetailArgs {
  snapshot: Snapshot
}

export default function SnapshotDetail({ snapshot }: SnapshotDetailArgs) {
  return (
    <Details $gap="1rem">
      <Heading>{formatDate(snapshot.createdAt)} Snapshot</Heading>
      <SubHeading>Details</SubHeading>
      <Stack $direction="row" $alignItems="center" $gap="1rem">
        <DetailName>Account DID</DetailName>
        <DetailValue>
          {shortenDID(snapshot.atprotoAccount)}
          <CopyButton text={snapshot.atprotoAccount} />
        </DetailValue>
      </Stack>
      <Stack $direction="row" $alignItems="center" $gap="1rem">
        <DetailName>Created At</DetailName>
        <DetailValue>{formatDate(snapshot.createdAt)}</DetailValue>
      </Stack>
      {snapshot.repositoryCid && (
        <Stack $direction="row" $alignItems="center" $gap="1rem">
          <DetailName>Repository</DetailName>
          <Link href={`/snapshots/${snapshot.id}/repo`}>
            <DetailValue>{shortenCID(snapshot.repositoryCid)}</DetailValue>
          </Link>
        </Stack>
      )}
      <Stack $direction="row" $alignItems="center" $gap="1rem">
        <DetailName>Blobs</DetailName>
        <Link href={`/snapshots/${snapshot.id}/repo`}>
          <DetailValue>View Blobs</DetailValue>
        </Link>
      </Stack>
    </Details>
  )
}
