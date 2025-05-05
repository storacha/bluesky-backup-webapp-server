'use client'

import { Account } from '@storacha/ui-react'
import { styled } from 'next-yak'
import { ReactNode, useEffect, useState } from 'react'

import { BlueskyAccountSelect } from '@/components/BackupScreen/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/BackupScreen/StorachaSpaceSelect'
import { Heading, Stack, Text } from '@/components/ui'
import { shortenDID } from '@/lib/ui'
import { Backup } from '@/types'

import { DataBox } from './Data'

interface BackupProps {
  account?: Account
  backup?: Backup
}

const Wrapper = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
`

const AccountsContainer = styled(Stack)`
  background-image: linear-gradient(0deg, var(--color-gray-light));
  background-size: 1rem 1px;
  background-repeat: no-repeat;
  background-position: center;
  gap: 1rem;
  align-items: center;
  position: relative;
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

  return (
    <>
      {account && <input type="hidden" name="account" value={account.did()} />}
      <Stack $gap="2rem">
        {backup ? (
          <Heading>{backup.name}</Heading>
        ) : (
          <Heading>New Backup</Heading>
        )}
        <Section title="Accounts">
          <AccountsContainer $direction="row">
            <Wrapper>
              <BlueskyAccountSelect
                name="atproto_account"
                {...(backup && {
                  disabled: true,
                  value: backup.atprotoAccount,
                })}
              />
            </Wrapper>
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
        </Section>

        <Section title="Data">
          <Stack $direction="row" $gap="1.25rem" $wrap="wrap">
            <DataBox
              name="include_repository"
              title="repository"
              description="Posts, Follows..."
              value={data.repository || false}
              onToggle={backup ? undefined : () => toggle('repository')}
            />
            <DataBox
              name="include_blobs"
              title="blobs"
              description="Images, Profile Picture..."
              value={data.blobs || false}
              onToggle={backup ? undefined : () => toggle('blobs')}
            />
          </Stack>
        </Section>
      </Stack>
    </>
  )
}
