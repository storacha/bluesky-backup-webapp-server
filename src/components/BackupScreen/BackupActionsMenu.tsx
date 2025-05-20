'use client'

import { DotsThree, PencilSimple, Trash } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
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

/* eslint-disable import/no-restricted-paths */
import { deleteBackup } from '@/app/backups/deleteBackup'
import { Spinner } from '@/components/ui'
import { Backup, State } from '@/types'

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
  const router = useRouter()
  const [state, setState] = useState<State>('idle')

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${backup.name}?`)) {
      setState('deleting')
      try {
        const result = await deleteBackup(backup.id)
        if (result.success) {
          toast.success('Backup deleted!')
          mutate(['api', '/api/backups'])
          router.push('/')
        } else {
          toast.error(`Failed to delete ${backup.name}`)
          console.error(result.error)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setState('idle')
      }
    }
  }

  if (state === 'deleting') {
    return <Spinner />
  }

  return (
    <MenuTrigger>
      <MenuButton aria-label="More actions">
        <DotsThree size={24} weight="bold" />
      </MenuButton>

      <Popover>
        <StyledMenu>
          <StyledMenuItem onAction={() => onEditAction()}>
            <PencilSimple size={18} />
            <MenuItemText>Edit name</MenuItemText>
          </StyledMenuItem>

          <StyledSeparator />

          <StyledMenuItem data-danger="true" onAction={() => handleDelete()}>
            <Trash size={18} />
            <MenuItemText>Delete backup</MenuItemText>
          </StyledMenuItem>
        </StyledMenu>
      </Popover>
    </MenuTrigger>
  )
}
