import Link from 'next/link'

import { cidUrl } from '@/lib/storacha'
import { formatDate, shortenDID } from '@/lib/ui'
import { Snapshot } from '@/types'

import { InlineCopyButton } from '../CopyButton'
import { DetailName, Details, DetailValue } from '../Details'
import { Heading, Stack, SubHeading } from '../ui'

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
