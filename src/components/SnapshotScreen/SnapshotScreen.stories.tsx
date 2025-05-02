import { SnapshotScreen } from './SnapshotScreen'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof SnapshotScreen> = {
  title: 'Components/SnapshotScreen',
  component: SnapshotScreen,
  tags: ['autodocs'],
  args: {
    snapshot: {
      id: 'abc',
      backupId: 'abc',
      atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
      repositoryStatus: 'success',
      repositoryCid:
        'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551repo',
      blobsStatus: 'in-progress',
      preferencesStatus: 'not-started',
      createdAt: '2025-04-07 19:51:56',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = 'SnapshotScreen'
