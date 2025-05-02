'use client'

import { Account, useAuthenticator } from '@storacha/ui-react'
import { styled } from 'next-yak'
import { ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CreateSnapshotButton } from '@/app/backups/[id]/CreateSnapshotButton'
import { Backup, SpaceDid } from '@/app/types'
import { BlueskyAccountSelect } from '@/components/BackupScreen/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/BackupScreen/StorachaSpaceSelect'
import { CreateButton } from '@/components/ui/CreateButton'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'
import { shortenDID } from '@/lib/ui'

import { Container, Heading, Stack, StyleProps, Text } from '../ui'

import { DataBox } from './Data'

let createNewBackup: typeof import('@/app/backups/new/createNewBackup').action

if (process.env.STORYBOOK) {
  createNewBackup = () => {
    throw new Error('Server Functions are not available in Storybook')
  }
} else {
  createNewBackup = (await import('@/app/backups/new/createNewBackup')).action
}

interface BackupProps {
  account?: Account
  backup?: Backup
}

const AccountsContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
`

const Wrapper = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
`

const ConnectingLine = styled.div`
  width: 30px;
  height: 1px;
  background-color: var(--color-gray-light);
  margin: 0;
  flex-shrink: 0;
`

export const Box = styled.div<Partial<StyleProps & { $isFocused?: boolean }>>`
  border: ${({ $borderWidth = '1px', $isFocused }) =>
      $isFocused ? '2px' : $borderWidth}
    ${({ $borderStyle = 'dashed', $isFocused }) =>
      $isFocused ? 'solid' : $borderStyle}
    ${({ $borderColor = 'var(--color-gray-light)', $isFocused }) =>
      $isFocused ? 'var(--color-dark-blue)' : $borderColor};
  border-radius: 12px;
  height: ${({ $height = '66px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  display: ${({ $display = '' }) => $display};
  justify-content: ${({ $justifyContent = '' }) => $justifyContent};
  align-items: center;
  padding: ${({ $padding = '0 0.6rem' }) => $padding};
  gap: ${({ $gap = 0 }) => $gap};
  cursor: pointer;
  background: ${({ $background = '' }) => $background};
  position: ${({ $position = '' }) => $position};
  top: ${({ $top = '' }) => $top};
  right: ${({ $right = '' }) => $right};
  left: ${({ $left = '' }) => $left};
  bottom: ${({ $bottom = '' }) => $bottom};
`

export const AccountLogo = styled.div<{
  $hasAccount?: boolean
  $type: 'original' | 'grayscale'
}>`
  height: 42px;
  width: 42px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--color-gray);
  & img {
    filter: ${({ $hasAccount, $type }) =>
      $hasAccount && $type === 'original' ? 'grayscale(0)' : 'grayscale(1)'};
    opacity: ${({ $hasAccount }) => ($hasAccount ? '1' : '.5')};
  }
`

interface DataConfig {
  title: string
  description: string
  key: string
  name: string
}

const DATA_BOXES: DataConfig[] = [
  {
    title: 'repository',
    description: 'Posts, Follows...',
    key: 'repository',
    name: 'include_repository',
  },
  {
    title: 'blobs',
    description: 'Images, Profile Picture...',
    key: 'blobs',
    name: 'include_blobs',
  },
  // {
  //   title: 'preferences',
  //   description: 'Subscriptions, Feeds...',
  //   key: 'preferences',
  //   name: 'include_preferences',
  // },
]

function NewBackupForm({
  children,
  setIsSubmitting,
}: {
  children: ReactNode
  setIsSubmitting?: (v: boolean) => void
}) {
  const [{ client }] = useAuthenticator()

  async function generateDelegationAndCreateNewBackup(formData: FormData) {
    try {
      if (setIsSubmitting) setIsSubmitting(true)
      const space = formData.get('storacha_space') as SpaceDid | undefined

      if (!space) {
        console.error('space id not defined, cannot create delegation.')
        toast.error('Space ID not defined, cannot create delegation.')
        if (setIsSubmitting) setIsSubmitting(false)
        return
      }

      if (!client) {
        console.error('client not defined, cannot create delegation')
        toast.error('Client not defined, cannot create delegation.')
        if (setIsSubmitting) setIsSubmitting(false)
        return
      }

      await client.setCurrentSpace(space)
      // upload the delegation to Storacha so we can use it later

      // Create a delegation valid for a year of backups
      const delegationDuration = 1000 * 60 * 60 * 24 * 365
      const delegationCid = await uploadCAR(
        client,
        new Blob([
          await delegate(client, space, { duration: delegationDuration }),
        ])
      )
      formData.append('delegation_cid', delegationCid.toString())

      const result = await createNewBackup(formData)
      return result
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message === 'NEXT_REDIRECT'
            ? 'Backup created successfully! Redirecting...'
            : error.message
          : 'Unknown error'
      )
      console.error('Backup creation error:', error)
    } finally {
      if (setIsSubmitting) setIsSubmitting(false)
    }
  }

  return <form action={generateDelegationAndCreateNewBackup}>{children}</form>
}

function MaybeForm({
  children,
  backup,
  setIsSubmitting,
}: {
  children: ReactNode
  backup?: Backup
  setIsSubmitting: (v: boolean) => void
}) {
  return backup ? (
    children
  ) : (
    <NewBackupForm setIsSubmitting={setIsSubmitting}>{children}</NewBackupForm>
  )
}

export const BackupDetail = ({ account, backup }: BackupProps) => {
  const [data, setData] = useState<Record<string, boolean>>({
    repository: true,
    blobs: false,
    preferences: false,
  })

  useEffect(() => {
    if (backup) {
      setData({
        repository: backup.includeRepository,
        blobs: backup.includeBlobs,
        preferences: backup.includePreferences,
      })
    }
  }, [backup])

  const toggle = (name: string) => {
    setData((prev) => ({
      ...prev,
      [name]: !prev?.[name],
    }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <>
      <MaybeForm backup={backup} setIsSubmitting={setIsSubmitting}>
        {account && (
          <input type="hidden" name="account" value={account.did()} />
        )}
        <Container>
          <Stack $gap="2rem">
            {backup ? (
              <Heading>{backup.name}</Heading>
            ) : (
              <Heading>New Backup</Heading>
            )}
            <Stack $gap="1rem">
              <AccountsContainer>
                <Wrapper>
                  <BlueskyAccountSelect
                    name="atproto_account"
                    {...(backup && {
                      disabled: true,
                      value: backup.atprotoAccount,
                    })}
                  />
                </Wrapper>
                <ConnectingLine />
                <Wrapper>
                  <StorachaSpaceSelect
                    name="storacha_space"
                    {...(backup && {
                      disabled: true,
                      value: shortenDID(backup.storachaSpace),
                    })}
                  />
                </Wrapper>
              </AccountsContainer>
            </Stack>
            <Stack $gap="1.25rem">
              <Text $textTransform="capitalize">data</Text>
              <Stack $direction="row" $gap="1.25rem" $wrap="wrap">
                {DATA_BOXES.map((box) => (
                  <DataBox
                    key={box.key}
                    name={box.name}
                    title={box.title}
                    description={box.description}
                    value={data[box.key] || false}
                    onToggle={() => !backup && toggle(box.key)}
                  />
                ))}
              </Stack>
            </Stack>
            {backup ? (
              <CreateSnapshotButton backup={backup} />
            ) : (
              <CreateButton $isLoading={isSubmitting} type="submit">
                create backup
              </CreateButton>
            )}
          </Stack>
        </Container>
      </MaybeForm>
    </>
  )
}
