//import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { styled } from 'next-yak'

import { Button, Container, Text } from '@/components/ui'
import { Snapshot } from '@/types'

import { SharedScreenLayout } from '../SharedScreen'

import SnapshotDetail from './SnapshotDetail'

const RestoreContainer = styled(Container)`
  height: 100vh;
  border-left: 1px solid var(--color-light-blue);
  padding: 2rem;
`

// const RestoreLink = styled(Link)`
//   display: block;
//   background-color: var(--color-dark-blue);
//   border-radius: 0.75rem;
//   color: var(--color-gray-medium);
//   font-family: var(--font-dm-mono);
//   font-size: 1rem;
//   padding: 0.25rem 1rem;
// `

export const SnapshotScreen = ({ snapshot }: { snapshot: Snapshot }) => {
  const params = useSearchParams()
  return (
    <SharedScreenLayout
      screenName="snapshots"
      selectedBackupId={snapshot.backupId}
      mainContent={<SnapshotDetail snapshot={snapshot} />}
      rightPanelContent={
        <RestoreContainer>
          {/* <RestoreLink href={`/snapshots/${snapshot.id}/restore`}>
            Restore
          </RestoreLink> */}
          <Button $font-size="1rem" disabled={!params.get('restore')}>
            Restore
            <Text>(coming soon!)</Text>
          </Button>
        </RestoreContainer>
      }
    />
  )
}
