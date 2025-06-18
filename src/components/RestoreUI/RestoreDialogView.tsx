// 'use client'

import { CredentialSession } from '@atproto/api'
import { CheckFatIcon, CloudIcon, DatabaseIcon } from '@phosphor-icons/react'
import { css, styled } from 'next-yak'

import { ATPROTO_DEFAULT_SINK } from '@/lib/constants'
import { shortenCID, shortenDID } from '@/lib/ui'

import { InlineCopyButton } from '../CopyButton'
import { DetailName, Details, DetailValue } from '../Details'
import { Box, Heading, Stack, StatefulButton, SubHeading, Text } from '../ui'
import { AtprotoLoginForm, LoginFn } from '../ui/atproto'

export interface Repo {
  cid: string
  encryptedWith?: string
  accountDid: string
  createdAt: Date
}

export interface Blob {
  cid: string
  contentType?: string
  encryptedWith?: string
}

const DataTypeHeading = styled(Heading)`
  font-size: 1rem;
  width: 112px;
`

interface DataSinkIconOptions {
  $restored?: boolean
}

const flexCenter = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const DataSinkIcon = styled.div<DataSinkIconOptions>`
  background-color: var(--color-white);
  color: ${({ $restored }) =>
    $restored ? 'var(--color-green)' : '--color-gray-medium'};
  border-color: ${({ $restored }) =>
    $restored ? 'var(--color-green)' : '--color-gray-medium'};
  width: 32px;
  height: 32px;
  ${flexCenter}
`

interface RestoreDialogViewProps {
  sinkSession?: CredentialSession
  loginToSink: LoginFn
  restoreRepo: () => Promise<void>
  restoreSnapshotBlobs: () => Promise<void>
  restoreBackupBlobs: () => Promise<void>
  repo?: Repo
  isRestoringRepo?: boolean
  isRepoRestored?: boolean
  snapshotBlobsCount?: number
  isRestoringSnapshotBlobs?: boolean
  areSnapshotBlobsRestored?: boolean
  backupBlobsCount?: number
  isRestoringBackupBlobs?: boolean
  areBackupBlobsRestored?: boolean
}

export function RestoreDialogView({
  sinkSession,
  loginToSink,
  restoreRepo,
  restoreSnapshotBlobs,
  restoreBackupBlobs,
  repo,
  isRestoringRepo,
  isRepoRestored,
  snapshotBlobsCount,
  isRestoringSnapshotBlobs,
  areSnapshotBlobsRestored,
  backupBlobsCount,
  isRestoringBackupBlobs,
  areBackupBlobsRestored,
}: RestoreDialogViewProps) {
  const hasSnapshotBlobs = Boolean(snapshotBlobsCount && (snapshotBlobsCount > 0))
  const hasBackupBlobs = Boolean(backupBlobsCount && (backupBlobsCount > 0))
  return (
    <Box $height="100%">
      {sinkSession ? (
        <Stack $gap="2rem">
          <Stack $gap="0.5rem">
            <Heading>Restore Snapshot</Heading>
            <SubHeading>
              Restore to {sinkSession.serviceUrl.hostname}
            </SubHeading>
            <Text>
              Use the controls below to restore this snapshot to{' '}
              {sinkSession.serviceUrl.hostname}.
            </Text>
          </Stack>
          {repo && (
            <Stack $gap="1rem">
              <Stack
                $direction="row"
                $alignItems="center"
                $justifyContent="space-between"
              >
                <DataTypeHeading>Repository</DataTypeHeading>
                <DataSinkIcon $restored={isRepoRestored}>
                  <DatabaseIcon size="16" />
                </DataSinkIcon>
              </Stack>
              <Details $gap="0.5rem">
                <Stack
                  $direction="row"
                  $alignItems="center"
                  $gap="1rem"
                  $justifyContent="space-between"
                >
                  <DetailName>Repository Content ID</DetailName>
                  <DetailValue>
                    {shortenCID(repo.cid)}
                    <InlineCopyButton text={repo.cid} />
                  </DetailValue>
                </Stack>
                <Stack
                  $direction="row"
                  $alignItems="center"
                  $gap="1rem"
                  $justifyContent="space-between"
                >
                  <DetailName>Account</DetailName>
                  <DetailValue>
                    {shortenDID(repo.accountDid)}
                    <InlineCopyButton text={repo.accountDid} />
                  </DetailValue>
                </Stack>
                <Stack
                  $direction="row"
                  $alignItems="center"
                  $gap="1rem"
                  $justifyContent="space-between"
                >
                  <DetailName>Created At</DetailName>
                  <DetailValue>{repo.createdAt.toDateString()}</DetailValue>
                </Stack>
              </Details>
              <StatefulButton
                onClick={restoreRepo}
                isLoading={Boolean(isRestoringRepo)}
                disabled={Boolean(isRestoringRepo || isRepoRestored)}
              >
                {isRepoRestored ? (
                  <CheckFatIcon color="var(--color-green)" />
                ) : (
                  'Restore'
                )}
              </StatefulButton>
            </Stack>
          )}
          {hasSnapshotBlobs && (
            <Stack $gap="1rem">
              <Stack
                $direction="row"
                $alignItems="center"
                $justifyContent="space-between"
              >
                <DataTypeHeading>Media In This Snapshot</DataTypeHeading>
                <DataSinkIcon $restored={areSnapshotBlobsRestored}>
                  <CloudIcon size="16" />
                </DataSinkIcon>
              </Stack>
              <Details $gap="0.5rem">
                <Stack
                  $direction="row"
                  $alignItems="center"
                  $gap="1rem"
                  $justifyContent="space-between"
                >
                  <DetailName>Count</DetailName>
                  <DetailValue>{snapshotBlobsCount}</DetailValue>
                </Stack>
              </Details>
              <StatefulButton
                onClick={restoreSnapshotBlobs}
                isLoading={Boolean(isRestoringSnapshotBlobs)}
                disabled={Boolean(
                  isRestoringSnapshotBlobs || areSnapshotBlobsRestored
                )}
              >
                {areSnapshotBlobsRestored ? (
                  <CheckFatIcon color="var(--color-green)" />
                ) : (
                  'Restore'
                )}
              </StatefulButton>
            </Stack>
          )}
          {hasBackupBlobs && (
            <Stack $gap="1rem">
              <Stack
                $direction="row"
                $alignItems="center"
                $justifyContent="space-between"
              >
                <DataTypeHeading>Media In This Backup</DataTypeHeading>
                <DataSinkIcon $restored={areBackupBlobsRestored}>
                  <CloudIcon size="16" />
                </DataSinkIcon>
              </Stack>
              <Details $gap="0.5rem">
                <Stack
                  $direction="row"
                  $alignItems="center"
                  $gap="1rem"
                  $justifyContent="space-between"
                >
                  <DetailName>Count</DetailName>
                  <DetailValue>{backupBlobsCount}</DetailValue>
                </Stack>
              </Details>
              <StatefulButton
                onClick={restoreBackupBlobs}
                isLoading={Boolean(isRestoringBackupBlobs)}
                disabled={Boolean(
                  isRestoringBackupBlobs || areBackupBlobsRestored
                )}
              >
                {areBackupBlobsRestored ? (
                  <CheckFatIcon color="var(--color-green)" />
                ) : (
                  'Restore'
                )}
              </StatefulButton>
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack $gap="1rem">
          <Stack $gap="0.25rem">
            <Heading>Data Restore</Heading>
            <SubHeading>Please log in to your ATProto account.</SubHeading>
          </Stack>
          <AtprotoLoginForm
            login={loginToSink}
            defaultServer={ATPROTO_DEFAULT_SINK}
          />
        </Stack>
      )}
    </Box>
  )
}
