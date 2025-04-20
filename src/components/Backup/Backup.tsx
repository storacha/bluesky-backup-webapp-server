import Image from 'next/image'
import { Button, Stack, Text } from '../ui'
import { styled } from 'next-yak'
import { CaretDown, PlusCircle } from '@phosphor-icons/react'
import { Property } from 'csstype'
import { useState } from 'react'
import { DataBox } from './Data'

interface BackupProps {
  id: number
  hasAccount: boolean
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

const AccountLogo = styled.div<{ $hasAccount?: boolean }>`
  height: 42px;
  width: 42px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--color-gray);
  & img {
    filter: ${({ $hasAccount }) =>
      $hasAccount ? 'grayscale(0)' : 'grayscale(1)'};
    opacity: ${({ $hasAccount }) => ($hasAccount ? '1' : '.5')};
  }
`

interface DataConfig {
  title: string
  description: string
  key: string
}

const DATA_BOXES: DataConfig[] = [
  {
    title: 'repository',
    description: 'Posts, Follows...',
    key: 'repository',
  },
  {
    title: 'blobs',
    description: 'Images, Profile Picture...',
    key: 'blobs',
  },
  {
    title: 'preferences',
    description: 'Subscriptions, Feeds...',
    key: 'preferences',
  },
]

export const Backup = ({ id, hasAccount }: BackupProps) => {
  const [data, setData] = useState<Record<string, boolean>>({
    repository: true,
    blobs: false,
    preferences: false,
  })

  const toggle = (name: string) => {
    setData((prev) => ({
      ...prev,
      [name]: !prev?.[name],
    }))
  }

  return (
    <Container>
      <Stack $gap="2rem">
        <Heading>backup #{id}</Heading>
        <Stack $gap="1rem">
          <AccountsContainer>
            <Box $background={hasAccount ? 'var(--color-white)' : ''}>
              <Stack $gap=".8rem" $direction="row" $alignItems="center">
                <AccountLogo $hasAccount={hasAccount}>
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Bluesky_Logo.svg"
                    alt="Bluesky Logo"
                    width={15}
                    height={15}
                  />
                </AccountLogo>
                <Text>Add bluesky account</Text>
              </Stack>
              <PlusCircle weight="fill" size="16" color="var(--color-gray-1)" />
            </Box>
            <ConnectingLine />
            <Box>
              <Stack $gap=".8rem" $direction="row" $alignItems="center">
                <AccountLogo>
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Bluesky_Logo.svg"
                    alt="Bluesky Logo"
                    width={15}
                    height={15}
                  />
                </AccountLogo>
                <Text>Select space</Text>
              </Stack>
              <CaretDown size="16" color="var(--color-gray-1)" />
            </Box>
          </AccountsContainer>
        </Stack>

        <Stack $gap="1.25rem">
          <Text $textTransform="capitalize">keychain</Text>
          <Box $height="44px" $width="48%">
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
                title={box.title}
                description={box.description}
                value={data[box.key] || false}
                onToggle={() => toggle(box.key)}
              />
            ))}
          </Stack>
        </Stack>

        <Button
          $background="var(--color-dark-blue)"
          $color="var(--color-white)"
          $textTransform="capitalize"
          $width="20%"
          $fontSize="0.75rem"
          $mt="1.4rem"
        >
          create backup
        </Button>
      </Stack>
    </Container>
  )
}
