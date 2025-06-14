import { isExpired } from '@ipld/dag-ucan'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import { useAuthenticator } from '@storacha/ui-react/dist/Authenticator'
import Link from 'next/link'
import { css, styled } from 'next-yak'
import { ComponentProps } from 'react'
import { toast } from 'sonner'

import { InlineCopyButton } from '@/components/CopyButton'
import { Loader } from '@/components/Loader'
import {
  Box,
  Button,
  Center,
  Explainer,
  ExText,
  Spinner,
  Stack,
  SubHeading,
} from '@/components/ui'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'
import { useSWR, useSWRImmutable, useSWRMutation } from '@/lib/swr'
import { formatDate, shortenCID, shortenDID } from '@/lib/ui'
import { Backup, PaginatedResult, Snapshot } from '@/types'

import { CreateSnapshotButton } from './CreateSnapshotButton'

const SnapshotContainer = styled(Stack)`
  margin-top: 3rem;
`

const Details = styled(Stack)`
  margin-top: 4rem;
`

const DetailName = styled(SubHeading)`
  color: black;
  width: 5rem;
`

const DetailValue = styled.div`
  font-family: var(--font-dm-mono);
  font-size: 0.75rem;
`

const SnapshotSummary = styled(Box)`
  padding: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const SnapshotLink = styled(Link)`
  display: block;
  font-family: var(--font-dm-mono);
  font-size: 1rem;
  text-align: center;
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
  const { data, isLoading } = useSWR([
    'api',
    `/api/backups/${backup.id}/snapshots`,
  ])
  // TODO: remove this cast once Fetchable no longer gets confused
  const snapshots = data as PaginatedResult<Snapshot>
  return (
    <>
      <Details $gap="1rem">
        <SubHeading>Details</SubHeading>
        <Stack $direction="row" $alignItems="center" $gap="1rem">
          <DetailName>Account DID</DetailName>
          <DetailValue>
            {shortenDID(backup.atprotoAccount)}
            <InlineCopyButton text={backup.atprotoAccount} size="0.75rem" />
          </DetailValue>
        </Stack>
        <Stack $direction="row" $gap="1rem">
          <DetailName>Delegation</DetailName>
          <DetailValue>
            <DelegationDetail backup={backup} />
          </DetailValue>
        </Stack>
        <Stack $direction="row" $alignItems="center" $gap="1rem">
          <DetailName>Media</DetailName>
          <Link href={`/backups/${backup.id}/blobs`}>
            <DetailValue>View Media</DetailValue>
          </Link>
        </Stack>
        <Stack $direction="row" $alignItems="center" $gap="1rem">
          <DetailName>Archived</DetailName>
          <DetailValue>{backup.archived ? 'yes' : 'no'}</DetailValue>
        </Stack>
      </Details>
      <SnapshotContainer $gap="2rem">
        <Stack $gap="0.5em" $direction="row" $alignItems="center" $my="1rem">
          <CreateSnapshotButton backup={backup} />
          {snapshots && snapshots?.count > 5 && (
            <SnapshotsLink href={`/backups/${backup.id}/snapshots`}>
              All Snapshots
            </SnapshotsLink>
          )}
        </Stack>
        <Stack $gap="0.6rem">
          {isLoading ? (
            <Center $height="200px">
              <Loader />
            </Center>
          ) : snapshots?.results.length === 0 ? (
            <Explainer>
              <ExText>
                We&apos;ll take a snapshot of your Bluesky account every hour.
              </ExText>
              <ExText>
                If you would like to create a snapshot now, click &ldquo;Create
                Snapshot&rdquo; above.
              </ExText>
            </Explainer>
          ) : (
            <>
              <SubHeading>Recent Snapshots</SubHeading>
              {snapshots?.results.slice(0, 5).map((snapshot) => (
                <SnapshotSummary
                  key={snapshot.id}
                  $background="var(--color-white)"
                >
                  <SnapshotLink href={`/snapshots/${snapshot.id}`}>
                    {formatDate(snapshot.createdAt)}
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
          <InlineCopyButton text={backup.delegationCid} />
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
      const { carCid: newDelegationCid } = await uploadCAR(
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
