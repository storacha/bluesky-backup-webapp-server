import Link from 'next/link'
import { styled } from 'next-yak'

import { cidUrl } from '@/lib/storacha'
import { formatDate, shortenDID } from '@/lib/ui'
import { Snapshot } from '@/types'

import { InlineCopyButton } from '../CopyButton'
import { Heading, Stack, SubHeading } from '../ui'

const Details = styled(Stack)``

const DetailName = styled(SubHeading)`
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
          <InlineCopyButton text={snapshot.atprotoAccount} />
        </DetailValue>
      </Stack>
      <Stack $direction="row" $alignItems="center" $gap="1rem">
        <DetailName>Created At</DetailName>
        <DetailValue>{formatDate(snapshot.createdAt)}</DetailValue>
      </Stack>
      {snapshot.repositoryCid && (
        <Stack $direction="row" $alignItems="start" $gap="1rem">
          <DetailName>Repository</DetailName>
          <DetailValue>
            <Stack $alignItems="start" $gap="0.5rem">
              <Link href={`/snapshots/${snapshot.id}/repo`}>Repo Explorer</Link>
              {snapshot.repositoryUploadCid && (
                <Link
                  href={cidUrl(snapshot.repositoryUploadCid)}
                  target="_blank"
                >
                  Storacha Gateway
                </Link>
              )}
            </Stack>
          </DetailValue>
        </Stack>
      )}
      <Stack $direction="row" $alignItems="center" $gap="1rem">
        <DetailName>Media</DetailName>
        <Link href={`/snapshots/${snapshot.id}/blobs`}>
          <DetailValue>View Media</DetailValue>
        </Link>
      </Stack>
    </Details>
  )
}
