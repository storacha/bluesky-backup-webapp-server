'use client'

import { styled } from 'next-yak'
import { ReactNode } from 'react'

import { Heading, Stack, Text } from '@/components/ui'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { Backup } from '@/types'

import { BlueskyAccountSelect } from './BlueskyAccountSelect'
import { DataBox } from './DataBox'
import { StorachaSpaceSelect } from './StorachaSpaceSelect'

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

const BackupNameInput = styled.input`
  border-radius: 8px;
  border: none;
  width: 100%;
  font-weight: 700;
  font-size: 1.125rem;

  &:focus {
    outline-color: var(--color-dark-blue);
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
  const { isMobile, isBaseLaptop } = useMobileScreens()
  return (
    <Stack $gap="2rem">
      {backup ? (
        <Heading>{backup.name}</Heading>
      ) : (
        <BackupNameInput
          type="text"
          name="name"
          placeholder="New Backup"
          defaultValue="New Backup"
          required
        />
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
              defaultValue={backup?.storachaSpace}
              disabled={!!backup}
            />
          </Wrapper>
        </AccountsContainer>
      </Section>
      <Section title="Data">
        <Stack
          $direction="row"
          $gap={isBaseLaptop ? '1rem' : '1.25rem'}
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
