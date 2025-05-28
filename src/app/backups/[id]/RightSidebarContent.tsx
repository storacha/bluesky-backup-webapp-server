import { ArrowsClockwiseIcon, IconProps } from '@phosphor-icons/react'
import { useAuthenticator } from '@storacha/ui-react/dist/Authenticator'
import { UCAN } from '@ucanto/core'
import Link from 'next/link'
import { keyframes, styled } from 'next-yak'
import { toast } from 'sonner'

import { Loader } from '@/components/Loader'
import {
  Box,
  Center,
  IconButton,
  Spinner,
  Stack,
  SubHeading,
} from '@/components/ui'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'
import { useSWR, useSWRMutation } from '@/lib/swr'
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
            <DelegationDetail backup={backup} />
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

const DelegationDetail = ({ backup }: { backup: Backup }) => {
  const { data: delegation, isLoading } = useSWR(
    backup.delegationCid !== null && [
      'delegation',
      { cid: backup.delegationCid },
    ]
  )

  if (!backup.delegationCid) {
    return <>No delegation set</>
  } else if (isLoading) {
    return (
      <>
        {isLoading && <Spinner size="xs" />} {shortenCID(backup.delegationCid)}
      </>
    )
  } else if (!delegation) {
    return <>❌ {shortenCID(backup.delegationCid)} Not Found</>
  } else if (UCAN.isExpired(delegation)) {
    return (
      <>
        ❌ {shortenCID(backup.delegationCid)} Expired{' '}
        <RedelegateButton backup={backup} />
      </>
    )
  }
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const RedelegateButtonIcon = styled<{ $spin?: boolean } & IconProps>(
  ArrowsClockwiseIcon
)`
  /* animation: ${spin} 2s linear infinite; */
  animation-name: ${({ $spin }) => ($spin ? spin : 'none')};
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`

const RedelegateButton = ({ backup }: { backup: Backup }) => {
  const [{ client }] = useAuthenticator()

  const { trigger, isMutating } = useSWRMutation(
    ['api', '/api/backups'],
    async () => {
      // Should not render the button at all when the client is not yet ready
      if (!client) return

      await client.setCurrentSpace(backup.storachaSpace)
      // upload the delegation to Storacha so we can use it later

      // Create a delegation valid for a year of backups
      const delegationDuration = 60 * 60 * 24 * 365
      const newDelegationCid = await uploadCAR(
        client,
        new Blob([
          await delegate(client, backup.storachaSpace, {
            duration: delegationDuration,
          }),
        ])
      )

      const response = await fetch(`/api/backups/${backup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delegationCid: newDelegationCid }),
      })

      if (!response.ok) {
        throw new Error(`Failed to redelegate authorization for backup`)
      }

      toast.success(
        `Backup reauthorized with new delegation: ${shortenCID(newDelegationCid)}`
      )
    }
  )

  if (!client) return null

  return (
    <IconButton
      title="Reauthorize Backup"
      aria-label="Reauthorize Backup"
      onClick={() => trigger()}
      disabled={isMutating}
    >
      <RedelegateButtonIcon
        size="0.75rem"
        color="var(--color-green)"
        display="block"
        $spin={isMutating}
      />
    </IconButton>
  )
}
