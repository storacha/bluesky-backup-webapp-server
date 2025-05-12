import Link from 'next/link'
import { css, styled } from 'next-yak'

import { Container } from '@/components/ui'
import { Snapshot } from '@/types'

import { SharedScreenLayout } from '../SharedScreen'

import SnapshotDetail from './SnapshotDetail'

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
  padding: 2rem;
`

const roundedFull = css`
  border-radius: calc(infinity * 1px);
`

const RestoreLink = styled(Link)`
  border-radius: 100%;
  border: 1px solid var(--color-black);
  padding: 0.25rem 1rem;
  ${roundedFull}
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
