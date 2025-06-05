'use client'

import { ArrowRightIcon } from '@phosphor-icons/react'
import { styled } from 'next-yak'
import { useState } from 'react'
import { toast } from 'sonner'

import { Heading, Spinner } from '@/components/ui'
import { useSWR } from '@/lib/swr'
import { Backup, State } from '@/types'

import { BackupActionsMenu } from './BackupActionsMenu'

const EditableBackupNameWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const BackupNameInput = styled.input`
  border-radius: 8px;
  border: 2px solid var(--color-gray-light);
  width: 100%;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 0.5rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--color-gray);
  }

  &:focus {
    outline: none;
    border-color: var(--color-dark-blue);
  }
`

const NameContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const SubmitIcon = styled(ArrowRightIcon)`
  color: var(--color-gray-medium);
  cursor: pointer;
  width: 20px;
  height: 20px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-dark-blue);
  }
`

interface EditableBackupNameProps {
  backup: Backup
}

export const EditableBackupName = ({ backup }: EditableBackupNameProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(backup.name)
  const { mutate } = useSWR(['api', '/api/backups'])
  const [state, setState] = useState<State>('idle')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()
    if (trimmedName === backup.name || !trimmedName) {
      setName(backup.name)
      setIsEditing(false)
      return
    }

    try {
      setState('loading')
      const response = await fetch(`/api/backups/${backup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      })

      if (!response.ok) {
        throw new Error('Failed to update backup name')
      }

      await mutate()
      toast.success('Backup name updated')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update backup name')
      setName(backup.name)
      setIsEditing(false)
    } finally {
      setState('idle')
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setName(backup.name)
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <EditableBackupNameWrapper>
      {isEditing ? (
        <>
          <BackupNameInput
            type="text"
            value={name}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
          {state === 'loading' ? (
            <Spinner />
          ) : (
            <SubmitIcon onClick={handleSubmit} />
          )}
        </>
      ) : (
        <NameContainer>
          <Heading>{backup.name}</Heading>
          <BackupActionsMenu
            backup={backup}
            onEditAction={() => handleEdit()}
          />
        </NameContainer>
      )}
    </EditableBackupNameWrapper>
  )
}
