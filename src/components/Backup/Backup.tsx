import { Button, Stack, Text } from '../ui'
import { styled } from 'next-yak'
import { Property } from 'csstype'
import { useEffect, useState } from 'react'
import { DataBox } from './Data'
import { BackupConfig } from '@/app/types'
import { action } from '@/app/configs/new/action'
import { Account } from '@storacha/ui-react'
import { BlueskyAccountSelect } from '@/components/Backup/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/Backup/StorachaSpaceSelect'
import { CreateBackupButton } from '@/app/configs/[id]/CreateBackupButton'
import { mutate } from 'swr'

interface BackupProps {
  account?: Account
  config?: BackupConfig
}

export const Container = styled.div`
  padding: 3.4rem 3.2em;
`

export const Heading = styled.h2`
  font-weight: 700;
  color: #000;
  font-size: 1.125rem;
  text-transform: capitalize;
`

export const SubHeading = styled.h3`
  font-weight: 600;
  color: var(--color-gray-medium);
  font-size: 0.75rem;
  text-transform: capitalize;
`

const AccountsContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`

export const Box = styled.div<{
  $height?: Property.Height
  $width?: Property.Height
  $background?: Property.Background
  $borderStyle?: Property.BorderStyle
}>`
  border: 1px ${({ $borderStyle = 'dashed' }) => $borderStyle}
    var(--color-gray-light);
  border-radius: 12px;
  height: ${({ $height = '66px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.6rem;
  gap: 2em;
  cursor: pointer;
  background: ${({ $background = '' }) => $background};
`

const ConnectingLine = styled.div`
  width: 30px;
  height: 1px;
  background-color: var(--color-gray-light);
  margin: 0;
`

export const AccountLogo = styled.div<{ $hasAccount?: boolean, $type: "original" | "grayscale" }>`
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

export const Backup = ({ account, config }: BackupProps) => {
  const [data, setData] = useState<Record<string, boolean>>({
    repository: true,
    blobs: false,
    preferences: false,
  })
  useEffect(() => {
    if (config) {
      setData({
        repository: config.includeRepository,
        blobs: config.includeBlobs,
        preferences: config.includePreferences
      })
    }
  }, [config])

  const toggle = (name: string) => {
    setData((prev) => ({
      ...prev,
      [name]: !prev?.[name],
    }))
  }

  return (
    <Container>
      <form action={action}>
        {account && <input type="hidden" name="account" value={account.did()} />}
        <Stack $gap="2rem">
          {config ? (
            <Heading>Backup #{config.id}</Heading>
          ) : (
            <Heading>New Backup</Heading>
          )
          }
          <Stack $gap="1rem">
            <AccountsContainer>
              <BlueskyAccountSelect name="atproto_account"
                {...config && { disabled: true, value: config.atprotoAccount }} />
              <ConnectingLine />
              <StorachaSpaceSelect name="storacha_space"
                {...config && { disabled: true, value: config.storachaSpace }} />
            </AccountsContainer>
          </Stack>

          {/* <Stack $gap="1.25rem">
            <Text $textTransform="capitalize">keychain</Text>
            <Box $height="44px" $width="48%">
              <Text $textTransform="capitalize">create keychain</Text>
              <PlusCircle weight="fill" size="16" color="var(--color-gray-1)" />
            </Box>
          </Stack> */}

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
                  onToggle={() => !config && toggle(box.key)}
                />
              ))}
            </Stack>
          </Stack>
          {config ? (
            <CreateBackupButton config={config} mutateBackups={() => mutate(['api', '/api/backup-configs'])}/>
          ) : (
            <Button
              type="submit"
              $background="var(--color-dark-blue)"
              $color="var(--color-white)"
              $textTransform="capitalize"
              $width="fit-content"
              $fontSize="0.75rem"
              $mt="1.4rem"
            >
              create backup
            </Button>
          )}
        </Stack>
      </form>
    </Container>
  )
}
