import Image from 'next/image'
import { Stack } from '../ui'
import { styled } from 'next-yak'
import { CaretDown, PlusCircle } from '@phosphor-icons/react'

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

const AccountContainer = styled.div`
  border: 1px dashed var(--color-gray-light);
  border-radius: 12px;
  height: 66px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.6rem;
  gap: 2em;
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

const AccountActionText = styled.p`
  color: var(--color-gray-medium);
  font-size: 12px;
  font-weight: 400;
`

export const Backup = ({ id, hasAccount }: BackupProps) => {
  return (
    <Container>
      <Stack $gap="2rem">
        <Heading>backup #{id}</Heading>
        <Stack $gap="1rem">
          <AccountsContainer>
            <AccountContainer>
              <Stack $gap=".8rem" $direction="row" $alignItems="center">
                <AccountLogo $hasAccount={hasAccount}>
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Bluesky_Logo.svg"
                    alt="Bluesky Logo"
                    width={15}
                    height={15}
                  />
                </AccountLogo>
                <AccountActionText>Add bluesky account</AccountActionText>
              </Stack>
              <PlusCircle weight="fill" size="16" color="var(--color-gray-1)" />
            </AccountContainer>
            <ConnectingLine />
            <AccountContainer>
              <Stack $gap=".8rem" $direction="row" $alignItems="center">
                <AccountLogo>
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Bluesky_Logo.svg"
                    alt="Bluesky Logo"
                    width={15}
                    height={15}
                  />
                </AccountLogo>
                <AccountActionText>Select space</AccountActionText>
              </Stack>
              <CaretDown size="16" color="var(--color-gray-1)" />
            </AccountContainer>
          </AccountsContainer>
        </Stack>
      </Stack>
    </Container>
  )
}
