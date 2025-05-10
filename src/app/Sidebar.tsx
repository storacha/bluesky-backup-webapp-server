import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { IdentificationBadge } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { css, styled } from 'next-yak'

import { Loader } from '@/components/Loader'
import { Stack } from '@/components/ui/Stack'

import { roundRectStyle } from '../components/ui'
import { useSWR } from '../lib/swr'

import { LogOutButton as BaseLogOutButton } from './authentication'

const SidebarOutside = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: space-between;

  width: 20rem;
  padding: 2rem;
  background-color: var(--color-gray-extra-light);
  border-right: 1px solid var(--color-light-blue);
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
  /* display: flex;
  flex-direction: column;
  gap: 1rem; */
  display: contents;
`

const backupItemLikeStyle = css`
  ${roundRectStyle}
  background-color: var(--color-white);
  /* TK: Correct box-shadow */
  box-shadow: 0px 0px 20px -5px var(--color-gray-light);
`

const BackupItem = styled.li<{ $selected?: boolean }>`
  ${backupItemLikeStyle}

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

export function Sidebar({
  selectedBackupId,
}: {
  selectedBackupId: string | null
}) {
  return (
    <SidebarOutside>
      <Stack>
        <Header>Storacha</Header>
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

  if (!data) return <BackupsLoader />

  return (
    <BackupList>
      {data.map(({ id, name }) => (
        <Link key={id} href={`/backups/${id}`}>
          <BackupItem $selected={id === selectedBackupId}>{name}</BackupItem>
        </Link>
      ))}
    </BackupList>
  )
}
