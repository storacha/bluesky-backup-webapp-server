'use client'

import { Modal, Stack, StyleProps, Text } from '../ui'
import { styled } from 'next-yak'
import { ReactNode, useEffect, useState } from 'react'
import { DataBox } from './Data'
import { Backup } from '@/app/types'
import { action } from '@/app/backups/new/action'
import { Account } from '@storacha/ui-react'
import { BlueskyAccountSelect } from '@/components/Backup/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/Backup/StorachaSpaceSelect'
import { CreateSnapshotButton } from '@/app/backups/[id]/CreateSnapshotButton'
import { PlusCircle } from '@phosphor-icons/react'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useUiComponentStore } from '@/store/ui'
import { CreateButton } from '@/components/ui/CreateButton'

interface BackupProps {
  account?: Account
  backup?: Backup
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
  padding: ${({ $padding = '0 0.6rem' }) => $padding};
  gap: ${({ $gap = 0 }) => $gap};
  cursor: pointer;
  background: ${({ $background = '' }) => $background};
`

const ConnectingLine = styled.div`
  width: 30px;
  height: 1px;
  background-color: var(--color-gray-light);
  margin: 0;
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

function BackupContainer({
  children,
  backup,
}: {
  children: ReactNode
  backup?: Backup
}) {
  return backup ? (
    <Container>{children}</Container>
  ) : (
    <Container>
      <form action={action}>{children}</form>
    </Container>
  )
}

export const BackupDetail = ({ account, backup }: BackupProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { updateUiStore } = useUiComponentStore()
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

  const openModal = () => {
    onOpen()
    updateUiStore({
      ui: 'keychain',
    })
  }

  return (
    <>
      <BackupContainer backup={backup}>
        {account && (
          <input type="hidden" name="account" value={account.did()} />
        )}
        <Stack $gap="2rem">
          {backup ? (
            <Heading>Backup #{backup.id}</Heading>
          ) : (
            <Heading>New Backup</Heading>
          )}
          <Stack $gap="1rem">
            <AccountsContainer>
              <BlueskyAccountSelect
                name="atproto_account"
                {...(backup && {
                  disabled: true,
                  value: backup.atprotoAccount,
                })}
              />
              <ConnectingLine />
              <StorachaSpaceSelect
                name="storacha_space"
                {...(backup && { disabled: true, value: backup.storachaSpace })}
              />
            </AccountsContainer>
          </Stack>

          <Stack $gap="1.25rem" onClick={openModal}>
            <Text $textTransform="capitalize">keychain</Text>
            <Box $height="44px" $width="48%" $display="flex">
              <Text $textTransform="capitalize">create keychain</Text>
              <PlusCircle weight="fill" size="16" color="var(--color-gray-1)" />
            </Box>
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
            <CreateButton type="submit">create backup</CreateButton>
          )}
        </Stack>
      </BackupContainer>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="UI store persistence!"
        hasCloseBtn
      >
        <Box $borderStyle="none">
          <Text>Testing the ui store thingy!</Text>
        </Box>
      </Modal>
    </>
  )
}
