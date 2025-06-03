'use client'

import { useAuthenticator } from '@storacha/ui-react'
import { CID } from 'multiformats'
import { styled } from 'next-yak'
import { ReactNode, useState } from 'react'

import { BlueskyAccountSelect } from '@/components/BackupScreen/BlueskyAccountSelect'
import { StorachaSpaceSelect } from '@/components/BackupScreen/StorachaSpaceSelect'
import {
  Button,
  Modal,
  Spinner,
  Stack,
  StatefulButton,
  Text,
} from '@/components/ui'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { useSWR } from '@/lib/swr'
import { Backup } from '@/types'

import { DataBox } from './DataBox'
import { EditableBackupName } from './EditableBackupName'

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
  width: 100%;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 0.5rem;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: var(--color-gray-medium);
  }

  &:focus {
    border-color: var(--color-dark-blue);
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

function BackupCleaner({ backup }: { backup: Backup }) {
  const [{ client }] = useAuthenticator()
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false)
  const { data, isLoading } = useSWR(['api', `/api/backups/${backup?.id}/cids`])
  const backupCids = data ? (data as string[]) : data

  const clearAllData = async () => {
    if (!client) throw new Error('client is undefined, cannot remove data')
    if (!backupCids)
      throw new Error('backupCids is undefined, cannot remove data')
    try {
      setIsDeleteInProgress(true)
      await client.setCurrentSpace(backup.storachaSpace)

      for (const cid of backupCids) {
        await client.remove(CID.parse(cid), { shards: true })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleteInProgress(false)
    }
  }

  return isLoading ? (
    <Spinner />
  ) : (
    <Stack $gap="1em">
      <Text>
        Are you sure you want to delete {backupCids?.length} uploads from
        Storacha? They may still remain available on the network for some amount
        of time.
      </Text>
      <StatefulButton
        isLoading={isDeleteInProgress}
        disabled={isDeleteInProgress}
        onClick={clearAllData}
        $background="var(--color-dark-blue)"
        $height="fit-content"
        $fontSize="0.75rem"
      >
        Yes, remove them all.
      </StatefulButton>
    </Stack>
  )
}

function DeleteBackupButton({ backup }: { backup: Backup }) {
  const [isDeleting, setIsDeleting] = useState(false)
  return (
    <>
      <Button
        $width="fit-content"
        $fontSize="0.75rem"
        onClick={() => {
          setIsDeleting(true)
        }}
        $background="var(--color-dark-red)"
      >
        Delete backup&hellip;
      </Button>
      <Modal
        isOpen={isDeleting}
        onClose={() => {
          setIsDeleting(false)
        }}
        title="Delete Stored Data"
        size="md"
      >
        {isDeleting && <BackupCleaner backup={backup} />}
      </Modal>
    </>
  )
}

type BackupDatas = 'include_repository' | 'include_blobs'

/**
 * A detail view/form for a Backup. If {@link Backup} is provided, its values
 * will be displayed, and the form elements will be disabled. Otherwise, the
 * form elements will be empty and editable.
 *
 * To submit the data, wrap this component with a form element.
 */
export const BackupDetail = ({ backup }: BackupProps) => {
  const { isMobile, isBaseLaptop } = useMobileScreens()

  const [dataBoxState, setDataBoxState] = useState<
    Record<BackupDatas, boolean>
  >({
    include_repository: backup?.includeRepository ?? true,
    include_blobs: backup?.includeBlobs ?? true,
  })

  const handleDataBoxChange = (name: string) => (value: boolean) => {
    setDataBoxState((prev) => {
      const updatedState = {
        ...prev,
        [name]: value,
      }
      const otherEntries = Object.entries(dataBoxState).filter(
        ([key]) => key !== name
      )
      // If all other entries are false,
      if (otherEntries.every(([, value]) => !value)) {
        return {
          ...updatedState,
          // Set the first other entry to true (or the current one back if it's the only one)
          [otherEntries[0]?.[0] ?? name]: true,
        }
      } else {
        return updatedState
      }
    })
  }

  return (
    <Stack $gap="2rem">
      {backup ? (
        <Stack $direction="row" $gap="1rem">
          <EditableBackupName backup={backup} />
        </Stack>
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
            isSelected={dataBoxState.include_repository}
            isDisabled={!!backup}
            onChange={handleDataBoxChange('include_repository')}
          />
          <DataBox
            name="include_blobs"
            label="Blobs"
            description="Images, Profile Picture..."
            isSelected={dataBoxState.include_blobs}
            isDisabled={!!backup}
            onChange={handleDataBoxChange('include_blobs')}
          />
        </Stack>
      </Section>
      {backup?.archived && <DeleteBackupButton backup={backup} />}
    </Stack>
  )
}
