import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { Stack } from '@/components/ui/Stack'
import { LogOutButton as BaseLogOutButton } from './authentication'
import { css, styled } from 'next-yak'
import { Suspense } from 'react'
import useSWR from 'swr'
import { Loader } from '@/components/Loader'
import { roundRectStyle } from '../components/ui'

const SidebarOutside = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: space-between;

  width: 20rem;
  padding: 2rem;
  background-color: var(--color-gray-extra-light);
  border-right: 1px solid var(--color-gray-medium-medium-light);
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

const ConfigList = styled.ul`
  /* display: flex;
  flex-direction: column;
  gap: 1rem; */
  display: contents;
`

const configItemLikeStyle = css`
  ${roundRectStyle}
  background-color: var(--color-white);
  /* TK: Correct box-shadow */
  box-shadow: 0px 0px 20px -5px var(--color-gray-light);
`

const ConfigItem = styled.li<{ $selected?: boolean }>`
  ${configItemLikeStyle}

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: var(--color-gray-light);
      background-color: var(--color-gray-medium-light);
      box-shadow: none;
    `}
`

const AddConfig = styled.a`
  ${configItemLikeStyle}

  box-shadow: none;
  border-color: var(--color-gray-light);
  border-style: dashed;
  color: var(--color-gray-medium);
  background-color: transparent;
  text-align: center;
  font-family: var(--font-dm-mono);
`

const actionButtonStyle = css`
  ${configItemLikeStyle}
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

export function Sidebar({ selectedConfig }: { selectedConfig: string | null }) {
  return (
    <SidebarOutside>
      <Stack>
        <Header>Storacha</Header>
        <Heading>Backup Configs</Heading>
        <Stack $gap="1rem">
          <Suspense fallback={<Loader />}>
            <Configs selectedConfig={selectedConfig} />
          </Suspense>
          <AddConfig href="/configs/new">Add new config…</AddConfig>
        </Stack>
      </Stack>
      <Stack $gap="1rem">
        <LogOutButton>
          Log Out <ActionIcon />
        </LogOutButton>
      </Stack>
    </SidebarOutside>
  )
}

function Configs({ selectedConfig }: { selectedConfig: string | null }) {
  const { data } = useSWR<{ backupConfigs: string[] }>('/api/backup-configs', {
    suspense: true,
  })

  // This should never happen, since we are using suspense and not conditionally
  // fetching.
  if (!data) return null

  return (
    <ConfigList>
      {data.backupConfigs.map((config) => (
        <ConfigItem key={config} $selected={config === selectedConfig}>
          {config}
        </ConfigItem>
      ))}
    </ConfigList>
  )
}
