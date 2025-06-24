//import Link from 'next/link'
import Link from 'next/link'
import { styled } from 'next-yak'

import { Container } from '@/components/ui'
import { Snapshot } from '@/types'

import { SharedScreenLayout } from '../SharedScreen'

import SnapshotDetail from './SnapshotDetail'

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: start;
`

const RestoreLink = styled(Link)`
  display: block;
  background-color: var(--color-dark-blue);
  border-radius: 0.75rem;
  color: var(--color-white);
  font-family: var(--font-dm-mono);
  font-size: 1rem;
  padding: 0.25rem 1rem;
`

export const SnapshotScreen = ({ snapshot }: { snapshot: Snapshot }) => {
  return (
    <SharedScreenLayout
      screenName="snapshots"
      selectedBackupId={snapshot.backupId}
      mainContent={<SnapshotDetail snapshot={snapshot} />}
      rightPanelContent={
        <RestoreContainer>
          <RestoreLink href={`/snapshots/${snapshot.id}/restore`}>
            Restore
          </RestoreLink>
        </RestoreContainer>
      }
    />
  )
}
