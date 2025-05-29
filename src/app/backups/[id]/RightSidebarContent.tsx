import { isExpired } from '@ipld/dag-ucan'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import { useAuthenticator } from '@storacha/ui-react/dist/Authenticator'
import Link from 'next/link'
import { css, styled } from 'next-yak'
import { ComponentProps } from 'react'
import { toast } from 'sonner'

import CopyButton from '@/components/CopyButton'
import { Loader } from '@/components/Loader'
import {
  Box,
  Button,
  Center,
  Spinner,
  Stack,
  SubHeading,
} from '@/components/ui'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'
import { useSWR, useSWRImmutable, useSWRMutation } from '@/lib/swr'
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
        <Stack $direction="row" $gap="1rem">
          <DetailName>Delegation</DetailName>
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

const DelegationStatus = styled<
  { $error: boolean } & ComponentProps<typeof Stack>
>(Stack)`
  ${({ $error }) =>
    $error &&
    css`
      color: var(--color-dark-red);
      font-weight: 500;
    `}
`

const DelegationDetail = ({ backup }: { backup: Backup }) => {
  const { data: delegation, isLoading } = useSWRImmutable(
    backup.delegationCid !== null && [
      'delegation',
      { cid: backup.delegationCid },
    ]
  )

  const errorMsg = isLoading ? null : !delegation ? (
    'Not Found'
  ) : isExpired(delegation.data) ? (
    <>Expired {formatExpiration(delegation.expiration)}</>
  ) : null

  const expirationMsg = !delegation ? null : (
    <>Expires {formatExpiration(delegation.expiration)}</>
  )

  return (
    <Stack>
      {backup.delegationCid && (
        <Stack $direction="row" $gap="0.25rem" $alignItems="center">
          <span title={backup.delegationCid}>
            {shortenCID(backup.delegationCid)}
          </span>
          <CopyButton text={backup.delegationCid} size="0.75rem" />
          {isLoading && <Spinner size="xs" />}
        </Stack>
      )}
      {!isLoading && (
        <>
          <DelegationStatus
            $direction="row"
            $gap="0.25rem"
            $alignItems="center"
            $error={!!errorMsg}
          >
            {errorMsg ? (
              <>
                {errorMsg} <XIcon size="0.75rem" />
              </>
            ) : (
              <>
                {expirationMsg} <CheckIcon size="0.75rem" />
              </>
            )}
          </DelegationStatus>
          {errorMsg && <RedelegateButton backup={backup} />}
        </>
      )}
    </Stack>
  )
}

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
        body: JSON.stringify({ delegationCid: newDelegationCid.toString() }),
      })

      if (!response.ok) {
        throw new Error(`Failed to redelegate authorization for backup`)
      }

      toast.success(
        `Backup reauthorized with new delegation: ${newDelegationCid}`
      )
    }
  )

  if (!client) return null

  return (
    <Button
      $fontSize="0.75rem"
      $px="0.5rem"
      $py="0.2rem"
      $borderRadius="0.5rem"
      $variant="secondary"
      onClick={() => trigger()}
      disabled={isMutating}
    >
      {isMutating ? <Spinner size="xs" /> : <>Reauthorize Backup</>}
    </Button>
  )
}

function formatExpiration(expiration: number) {
  return new Date(expiration * 1000).toLocaleDateString()
}
