// 'use client'

import { CredentialSession } from '@atproto/api'
import {
  Popover as HPopover,
  PopoverButton as HPopoverButton,
  PopoverPanel as HPopoverPanel,
} from '@headlessui/react'
import { CircleStackIcon } from '@heroicons/react/20/solid'
import { ArrowCircleRight, Cloud, Database } from '@phosphor-icons/react'
import { css, styled } from 'next-yak'

import { ATPROTO_DEFAULT_SINK } from '@/lib/constants'
import { shortenDID } from '@/lib/ui'

import { Box, Button, Heading, Stack, SubHeading, Text } from '../ui'
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

const Popover = styled(HPopover)`
  display: relative;
`

const PopoverButton = styled(HPopoverButton)`
  outline: none;
`

const PopoverPanel = styled(HPopoverPanel)`
  display: flex;
  background: white;
  border: 1px solid black;
  border-radius: 0.75rem;
  padding: 0.75rem;
`

const DataTypeHeading = styled(Heading)`
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

const DataSourceIcon = styled.div`
  ${flexCenter}
  width: 32px;
  &:hover {
    background-color: var(--color-white);
  }
`
//  < div className = "rounded-full hover:bg-white border w-8 h-8 flex flex-col justify-center items-center" >
//<span className="font-bold text-sm ">

const StorachaElement = styled.div`
  ${flexCenter}
  width: 112px;
`

const AtProtoElement = styled.div`
  ${flexCenter}
  width: 112px;
`

interface RestoreDialogViewProps {
  sinkSession?: CredentialSession
  loginToSink: LoginFn
  restoreRepo: () => Promise<void>
  restoreBlobs: () => Promise<void>
  repo?: Repo
  blobs?: Blob[]
  isRestoringRepo?: boolean
  isRestoringBlobs?: boolean
  isRepoRestored?: boolean
  areBlobsRestored?: boolean
}

export function RestoreDialogView({
  sinkSession,
  loginToSink,
  restoreRepo,
  restoreBlobs,
  repo,
  blobs,
  isRestoringRepo,
  isRestoringBlobs,
  isRepoRestored,
  areBlobsRestored,
}: RestoreDialogViewProps) {
  return (
    <Box $height="100%">
      {sinkSession ? (
        <Stack $alignItems="center">
          <Stack $alignItems="center">
            <Stack $alignItems="start">
              <Stack
                $gap="1rem"
                $direction="row"
                $alignItems="center"
                $width="100%"
                $bottom="1rem"
              >
                <DataTypeHeading />
                <StorachaElement>
                  <Text>Storacha</Text>
                </StorachaElement>
                <div style={{ width: '48px' }}></div>
                <AtProtoElement>
                  <Stack>
                    <Text>{sinkSession?.serviceUrl.hostname}</Text>
                    <Text>
                      {sinkSession.did && shortenDID(sinkSession.did)}
                    </Text>
                  </Stack>
                </AtProtoElement>
              </Stack>

              <Stack
                $gap="1rem"
                $direction="row"
                $alignItems="center"
                $left="1rem"
                $right="1rem"
              >
                <DataTypeHeading>Repository</DataTypeHeading>
                <StorachaElement>
                  <DataSourceIcon>
                    <Popover>
                      <PopoverButton>
                        <CircleStackIcon
                          style={{ width: '16px', height: '16px' }}
                        />
                      </PopoverButton>
                      <PopoverPanel anchor="bottom">
                        <div>Account: {repo?.accountDid}</div>
                        <div>Created At: {repo?.createdAt.toDateString()}</div>
                      </PopoverPanel>
                    </Popover>
                  </DataSourceIcon>
                </StorachaElement>
                {isRestoringRepo ? (
                  <Button
                    $isLoading
                    $hideLoadingText
                    $variant="outline"
                    aria-label="Restoring repository"
                  />
                ) : (
                  <Button
                    onClick={restoreRepo}
                    disabled={isRestoringRepo}
                    $variant="outline"
                    $leftIcon={
                      <ArrowCircleRight
                        size="16"
                        color="var(--color-gray-medium)"
                      />
                    }
                  />
                )}
                <AtProtoElement>
                  <DataSinkIcon $restored={isRepoRestored}>
                    <Database size="16" />
                  </DataSinkIcon>
                </AtProtoElement>
              </Stack>

              <Stack
                $gap="1rem"
                $direction="row"
                $alignItems="center"
                $left="1rem"
                $right="1rem"
              >
                <DataTypeHeading>Media</DataTypeHeading>
                <StorachaElement>
                  <DataSourceIcon>{blobs?.length || '0'}</DataSourceIcon>
                </StorachaElement>
                {isRestoringBlobs ? (
                  <Button
                    $isLoading
                    $hideLoadingText
                    $variant="outline"
                    className="rounded-full w-8 h-8"
                    aria-label="Restoring blobs"
                  />
                ) : (
                  <Button
                    onClick={restoreBlobs}
                    disabled={isRestoringBlobs}
                    $variant="outline"
                    className="rounded-full w-8 h-8"
                    $leftIcon={
                      <ArrowCircleRight
                        size="16"
                        color="var(--color-gray-medium)"
                      />
                    }
                  />
                )}
                <AtProtoElement>
                  <DataSinkIcon $restored={areBlobsRestored}>
                    <Cloud size="16" color="var(--color-gray-medium)" />
                  </DataSinkIcon>
                </AtProtoElement>
              </Stack>
            </Stack>
          </Stack>
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
