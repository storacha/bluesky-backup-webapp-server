'use client'

import {
  BoxArrowUpIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react'
import { ArchiveIcon } from '@phosphor-icons/react/dist/ssr'
import { styled } from 'next-yak'
import { useState } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Separator,
} from 'react-aria-components'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Spinner } from '@/components/ui'
import { Backup, State } from '@/types'

import { BackupPauseButton } from './BackupPauseButton'

const MenuButton = styled(Button)`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--color-gray-light);
  }

  &:focus-visible {
    outline: 2px solid var(--color-dark-blue);
    outline-offset: 2px;
  }
`

const StyledMenu = styled(Menu)`
  min-width: 180px;
  padding: 0.5rem 0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  outline: none;
`

const StyledMenuItem = styled(MenuItem)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  outline: none;

  &:hover,
  &:focus-visible {
    background-color: var(--color-gray-light);
  }

  &[data-danger='true'] {
    color: var(--color-red, red);
  }
`

const StyledSeparator = styled(Separator)`
  height: 1px;
  background-color: var(--color-gray-light);
  margin: 0.5rem 0;
`

const MenuItemText = styled.span`
  font-size: 0.9rem;
`

interface BackupActionsMenuProps {
  backup: Backup
  onEditAction: () => void
}

export function BackupActionsMenu({
  backup,
  onEditAction,
}: BackupActionsMenuProps) {
  const [state, setState] = useState<State>('idle')

  const setArchived = async (archived: boolean) => {
    setState('deleting')
    try {
      const request = await fetch(`/api/backups/${backup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived }),
      })

      if (request.ok) {
        toast.success(`Backup ${archived ? 'archived' : 'unarchived'}!`)
        mutate(['api', '/api/backups'])
        mutate(['api', '/api/backups/archived'])
      } else {
        toast.error(
          `Failed to ${archived ? 'archive' : 'unarchive'} ${backup.name}`
        )
      }
    } catch (error) {
      console.error(error)
    } finally {
      setState('idle')
    }
  }

  const archiveBackup = () => setArchived(true)
  const unarchiveBackup = () => setArchived(false)

  if (state === 'deleting') {
    return <Spinner />
  }

  return (
    <MenuTrigger>
      <MenuButton aria-label="More actions">
        <DotsThreeIcon size={24} weight="bold" />
      </MenuButton>

      <Popover>
        <StyledMenu>
          <StyledMenuItem onAction={() => onEditAction()}>
            <PencilSimpleIcon size={18} />
            <MenuItemText>Edit name</MenuItemText>
          </StyledMenuItem>
          <StyledMenuItem>
            <BackupPauseButton backup={backup} />
            <MenuItemText>Pause backup</MenuItemText>
          </StyledMenuItem>
          <StyledSeparator />
          {backup.archived ? (
            <StyledMenuItem
              data-danger="true"
              onAction={() => unarchiveBackup()}
            >
              <BoxArrowUpIcon size={18} />
              <MenuItemText>Unarchive backup</MenuItemText>
            </StyledMenuItem>
          ) : (
            <StyledMenuItem data-danger="true" onAction={() => archiveBackup()}>
              <ArchiveIcon size={18} />
              <MenuItemText>Archive backup</MenuItemText>
            </StyledMenuItem>
          )}
        </StyledMenu>
      </Popover>
    </MenuTrigger>
  )
}
