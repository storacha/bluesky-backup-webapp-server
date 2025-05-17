import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { Trash } from '@phosphor-icons/react'
import { IdentificationBadge } from '@phosphor-icons/react/dist/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { css, styled } from 'next-yak'
import { MouseEvent, useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Loader } from '@/components/Loader'
import { Button, roundRectStyle, Spinner, Stack } from '@/components/ui'
import wordlogo from '@/images/wordlogo.png'
import { useSWR } from '@/lib/swr'
import { shortenIfOver } from '@/lib/ui'
import { Backup, State } from '@/types'

import { LogOutButton as BaseLogOutButton } from './authentication'
import { deleteBackup } from './backups/deleteBackup'

const SidebarOutside = styled.nav<{ $variant?: 'desktop' | 'mobile' }>`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: space-between;
  width: ${({ $variant }) => ($variant === 'mobile' ? '13rem' : '20rem')};
  padding: 2rem;
  background-color: var(--color-gray-extra-light);
  border-right: 1px solid var(--color-light-blue);

  ${({ $variant }) =>
    $variant === 'desktop' &&
    css`
      @media only screen and (min-width: 0px) and (max-width: 992px) {
        display: none;
      }
    `}

  ${({ $variant }) =>
    $variant === 'mobile' &&
    css`
      width: 100%;
      height: 100%;
      border-right: none;
    `}

  @media only screen and (min-width: 993px) and (max-width: 1024px) {
    width: 13rem;
    padding: 1rem;
  }
`

const Header = styled.header`
  font-size: 1.5rem;
  font-weight: bold;
  padding-bottom: 2rem;
`

const Heading = styled.h2`
  font-size: 1rem;
  font-weight: 500;
  padding-bottom: 1rem;
  color: var(--color-gray-medium);
`

const BackupList = styled.ul`
  display: flex;
  flex-flow: column;
  gap: 0.8rem;
  height: 60vh;
  overflow-y: auto;
`

const backupItemLikeStyle = css`
  ${roundRectStyle}
  background-color: var(--color-white);
  /* TK: Correct box-shadow */
  box-shadow: 0px 0px 20px -5px var(--color-gray-light);
`

const BackupItem = styled.li<{ $selected?: boolean }>`
  ${backupItemLikeStyle}

  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: var(--color-gray-light);
      background-color: var(--color-gray-medium-light);
      box-shadow: none;
    `}
`

const AddBackup = styled(Link)`
  ${backupItemLikeStyle}

  box-shadow: none;
  border-color: var(--color-gray-light);
  border-style: dashed;
  color: var(--color-gray-medium);
  background-color: transparent;
  text-align: center;
  font-family: var(--font-dm-mono);
  font-size: 0.75rem;
`

const actionButtonStyle = css`
  ${backupItemLikeStyle}
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ActionIcon = styled(ArrowRightIcon)`
  width: 1.25rem;
  color: var(--color-gray-medium);
`

const LogOutButton = styled(BaseLogOutButton)`
  /* TK: Needs active state */
  ${actionButtonStyle}
`

const IdentitiesLink = styled(Link)`
  ${actionButtonStyle}
`

interface SidebarProps {
  selectedBackupId: string | null
  variant?: 'desktop' | 'mobile'
}

export function Sidebar({
  selectedBackupId,
  variant = 'desktop',
}: SidebarProps) {
  return (
    <SidebarOutside $variant={variant}>
      <Stack>
        <Header>
          <Link href="/">
            <Image src={wordlogo} alt="Storacha" width="164" height="57" />
          </Link>
        </Header>
        <Heading>Backups</Heading>
        <Stack $gap="1rem">
          <Backups selectedBackupId={selectedBackupId} />
          <AddBackup href="/">Add backup…</AddBackup>
        </Stack>
      </Stack>
      <Stack $gap="1rem">
        <IdentitiesLink href="/identities">
          Identities <IdentificationBadge />
        </IdentitiesLink>
        <LogOutButton>
          Log Out <ActionIcon />
        </LogOutButton>
      </Stack>
    </SidebarOutside>
  )
}

const BackupsLoader = styled(Loader)`
  align-self: center;
  color: var(--color-gray-medium);
`

function Backups({ selectedBackupId }: { selectedBackupId: string | null }) {
  const { data } = useSWR(['api', '/api/backups'])
  const [state, setState] = useState<State>('idle')
  const [backup, setBackup] = useState<Backup>()

  if (!data) return <BackupsLoader />

  const handleDelete = async (id: string, e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const backup = data.find((backup) => backup.id === id)
    setBackup(backup)
    const backupName = backup?.name

    if (confirm(`Are you sure you want to delete ${backupName}?`)) {
      setState('deleting')
      try {
        const result = await deleteBackup(id)
        if (result.success) {
          toast.success('Backup deleted!')
          mutate(['api', '/api/backups'])
        } else {
          toast.error(`Failed to delete ${backupName}`)
          console.error(result.error)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setState('idle')
      }
    }
  }

  return (
    <BackupList>
      {data.map(({ id, name }) => {
        const modifiedName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`
        return (
          <Link key={id} href={`/backups/${id}`}>
            <BackupItem $selected={id === selectedBackupId}>
              {shortenIfOver(modifiedName)}
              {state === 'deleting' && id === backup?.id ? (
                <Spinner />
              ) : (
                <Button
                  $background="none"
                  $noPadding
                  $border="1px solid red"
                  onClick={(e: MouseEvent) => handleDelete(id, e)}
                >
                  <Trash size={18} color="var(--color-black)" />
                </Button>
              )}
            </BackupItem>
          </Link>
        )
      })}
    </BackupList>
  )
}
