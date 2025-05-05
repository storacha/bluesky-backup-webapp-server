'use client'

import Link from 'next/link'
import { styled } from 'next-yak'

import { Sidebar } from '@/app/Sidebar'
import { BackupScreen } from '@/components/BackupScreen'
import { BackupDetail } from '@/components/BackupScreen/BackupDetail'
import { Box, Stack, SubHeading } from '@/components/ui'
import { useStorachaAccount } from '@/hooks/use-plan'
import { useSWR } from '@/lib/swr'
import { formatDate, shortenCID, shortenDID } from '@/lib/ui'
import { Backup } from '@/types'

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

const RightSidebarContent = ({ backup }: { backup: Backup }) => {
  const { data: snapshots } = useSWR([
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
      </Details>
      <SnapshotContainer $gap="1rem">
        <SubHeading>Snapshots</SubHeading>
        {snapshots?.map((snapshot) => (
          <SnapshotSummary key={snapshot.id} $background="var(--color-white)">
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
  )
}

export default function BackupPage({ id }: { id: string }) {
  const account = useStorachaAccount()

  // TODO: Should we fetch individual backups? We already need the list for the
  // sidebar, and they're not heavy so far, but we should check back on this at
  // the end of the first version.
  const { data: backups, error } = useSWR(['api', '/api/backups'])
  if (error) throw error
  const backup = backups?.find((backup) => backup.id === id)

  if (!backup) return null

  return (
    <>
      <Sidebar selectedBackupId={id} />
      <BackupScreen sidebarContent={<RightSidebarContent backup={backup} />}>
        <BackupDetail account={account} backup={backup} />
      </BackupScreen>
    </>
  )
}
