'use client'

import { Account, useAuthenticator } from '@storacha/ui-react'
import { styled } from 'next-yak'
import { ReactNode, useEffect, useState } from 'react'

import { CreateSnapshotButton } from '@/app/backups/[id]/CreateSnapshotButton'
import { Backup, SpaceDid } from '@/app/types'
import { BlueskyAccountSelect } from '@/components/BackupScreen/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/BackupScreen/StorachaSpaceSelect'
import { CreateButton } from '@/components/ui/CreateButton'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'

import { Container, Heading, Spinner, Stack, StyleProps, Text } from '../ui'

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

const AccountsContainer = styled(Stack)`
  background-image: linear-gradient(0deg, var(--color-gray-light));
  background-size: 1rem 1px;
  background-repeat: no-repeat;
  background-position: center;
  gap: 1rem;
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
  justify-content: space-between;
  align-items: center;
  gap: ${({ $gap = 0 }) => $gap};
  background: ${({ $background = '' }) => $background};
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
    console.log('GENERATING', setIsSubmitting)
    if (setIsSubmitting) setIsSubmitting(true)
    const space = formData.get('storacha_space') as SpaceDid | undefined
    if (!space) {
      console.error('space id not defined, cannot create delegation.')
      throw new Error('space is not defined, cannot create delegation')
    }
    if (!client) {
      console.error('client not defined, cannot create delegation')
      throw new Error('client is not defined, cannot create delegation')
    }
    await client.setCurrentSpace(space)
    // upload the delegation to Storacha so we can use it later

    // create a delegation valid for a year of backups
    const delegationDuration = 1000 * 60 * 60 * 24 * 365
    const delegationCid = await uploadCAR(
      client,
      new Blob([
        await delegate(client, space, { duration: delegationDuration }),
      ])
    )
    formData.append('delegation_cid', delegationCid.toString())
    const result = await createNewBackup(formData)
    if (setIsSubmitting) setIsSubmitting(false)
    return result
  }
  return (
    <Container>
      <form action={generateDelegationAndCreateNewBackup}>{children}</form>
    </Container>
  )
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

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <Stack $gap="0.75rem">
    <Text>{title}</Text>
    {children}
  </Stack>
)

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
    <MaybeForm backup={backup} setIsSubmitting={setIsSubmitting}>
      {account && <input type="hidden" name="account" value={account.did()} />}
      <Container>
        <Stack $gap="2.5rem">
          {backup ? (
            <Heading>Backup #{backup.id}</Heading>
          ) : (
            <Heading>New Backup</Heading>
          )}
          <Section title="Accounts">
            <AccountsContainer $direction="row" $even>
              <BlueskyAccountSelect
                name="atproto_account"
                {...(backup && {
                  disabled: true,
                  value: backup.atprotoAccount,
                })}
              />
              <StorachaSpaceSelect
                name="storacha_space"
                {...(backup && {
                  disabled: true,
                  value: backup.storachaSpace,
                })}
              />
            </AccountsContainer>
          </Section>

          <Section title="Data">
            <Stack $direction="row" $gap="1rem" $even $wrap="wrap">
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
          </Section>
          {backup ? (
            <CreateSnapshotButton backup={backup} />
          ) : isSubmitting ? (
            <Spinner />
          ) : (
            <CreateButton type="submit">create backup</CreateButton>
          )}
        </Stack>
      </Container>
    </MaybeForm>
  )
}
