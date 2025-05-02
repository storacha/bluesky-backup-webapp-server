'use client'

import { Account, useAuthenticator } from '@storacha/ui-react'
import { styled } from 'next-yak'
import { ReactNode, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

import { CreateSnapshotButton } from '@/app/backups/[id]/CreateSnapshotButton'
import { Backup, SpaceDid } from '@/app/types'
import { BlueskyAccountSelect } from '@/components/BackupScreen/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/BackupScreen/StorachaSpaceSelect'
import { CreateButton } from '@/components/ui/CreateButton'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'
import { shortenDID } from '@/lib/ui'

import { Container, Heading, Stack, Text } from '../ui'

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

const CreateBackupButton = () => {
  const { pending } = useFormStatus()

  return (
    <CreateButton $isLoading={pending} type="submit">
      create backup
    </CreateButton>
  )
}

function NewBackupForm({ children }: { children: ReactNode }) {
  const [{ client }] = useAuthenticator()

  async function generateDelegationAndCreateNewBackup(formData: FormData) {
    try {
      const space = formData.get('storacha_space') as SpaceDid | undefined

      if (!space) {
        console.error('space id not defined, cannot create delegation.')
        toast.error('Space ID not defined, cannot create delegation.')
        return
      }

      if (!client) {
        console.error('client not defined, cannot create delegation')
        toast.error('Client not defined, cannot create delegation.')
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
    }
  }

  return <form action={generateDelegationAndCreateNewBackup}>{children}</form>
}

function MaybeForm({
  children,
  backup,
}: {
  children: ReactNode
  backup?: Backup
}) {
  return backup ? children : <NewBackupForm>{children}</NewBackupForm>
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

  return (
    <>
      <MaybeForm backup={backup}>
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
              <CreateBackupButton />
            )}
          </Stack>
        </Container>
      </MaybeForm>
    </>
  )
}
