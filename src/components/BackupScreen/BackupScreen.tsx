'use client'

import Link from 'next/link'
import { styled } from 'next-yak'
import { Suspense } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import useSWR from 'swr'

import { useStorachaAccount } from '@/hooks/use-plan'
import { formatDate, shortenCID, shortenDID } from '@/lib/ui'
import { Backup, Snapshot } from '@/types'

import { Box, Center, Heading, Stack, SubHeading, Text } from '../ui'

import { BackupDetail } from './BackupDetail'
import RightSidebar from './RightSidebar'

const BackupContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: var(--color-light-blue-10);
  height: 100vh;
`

const ResizeHandleOuter = styled.div`
  display: flex;
  align-items: stretch;
  width: 10px;
  cursor: col-resize;
  justify-content: center;
`

const ResizeHandleInner = styled.div`
  width: 1px;
  background-color: var(--color-gray-light);
  &:hover {
    width: 2px;
    background-color: var(--color-gray);
  }
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

export const BackupScreen = ({ backup }: { backup?: Backup }) => {
  const account = useStorachaAccount()
  const { data: snapshots } = useSWR<Snapshot[]>(
    backup && ['api', `/api/backups/${backup.id}/snapshots`]
  )

  return (
    <BackupContainer>
      <PanelGroup autoSaveId="backup-restore-layout" direction="horizontal">
        <Panel defaultSize={60} minSize={45}>
          <Suspense>
            <BackupDetail account={account} backup={backup} />
          </Suspense>
        </Panel>
        <PanelResizeHandle>
          <ResizeHandleOuter>
            <ResizeHandleInner />
          </ResizeHandleOuter>
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={40}>
          <Suspense>
            <RightSidebar>
              <Heading>Backup & Restore</Heading>
              {backup ? (
                <>
                  <Details $gap="1rem">
                    <SubHeading>Details</SubHeading>
                    <Stack $direction="row" $alignItems="center" $gap="1rem">
                      <DetailName>Account DID</DetailName>
                      <DetailValue>
                        {shortenDID(backup.atprotoAccount)}
                      </DetailValue>
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
                    Press &quot;Create Backup&quot; to get started!
                  </Instruction>
                </Center>
              )}
            </RightSidebar>
          </Suspense>
        </Panel>
      </PanelGroup>
    </BackupContainer>
  )
}
