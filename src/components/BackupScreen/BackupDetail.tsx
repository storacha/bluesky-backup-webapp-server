'use client'

import { Did } from '@atproto/api'
import { styled } from 'next-yak'
import { ReactNode } from 'react'

import { BlueskyAccountSelect } from '@/components/BackupScreen/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/BackupScreen/StorachaSpaceSelect'
import { Heading, Stack, Text } from '@/components/ui'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { shortenDID } from '@/lib/ui'
import { Backup } from '@/types'

import { DataBox } from './DataBox'

interface BackupProps {
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

  @media only screen and (min-width: 0px) and (max-width: 576px) {
    display: none;
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

/**
 * A detail view/form for a Backup. If {@link Backup} is provided, its values
 * will be displayed, and the form elements will be disabled. Otherwise, the
 * form elements will be empty and editable.
 *
 * To submit the data, wrap this component with a form element.
 */
export const BackupDetail = ({ backup }: BackupProps) => {
  const { isMobile } = useMobileScreens()
  return (
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
              defaultValue={backup?.atprotoAccount}
              disabled={!!backup}
            />
          </Wrapper>
          <Wrapper>
            <StorachaSpaceSelect
              name="storacha_space"
              defaultValue={shortenDID(backup?.atprotoAccount as Did)}
              disabled={!!backup}
            />
          </Wrapper>
        </AccountsContainer>
      </Section>

      <Section title="Data">
        <Stack
          $direction="row"
          $gap="1.25rem"
          $wrap={isMobile ? 'nowrap' : 'wrap'}
        >
          <DataBox
            name="include_repository"
            label="Repository"
            description="Posts, Follows..."
            defaultSelected={backup?.includeRepository}
            isDisabled={!!backup}
          />
          <DataBox
            name="include_blobs"
            label="Blobs"
            description="Images, Profile Picture..."
            defaultSelected={backup?.includeBlobs}
            isDisabled={!!backup}
          />
        </Stack>
      </Section>
    </Stack>
  )
}
