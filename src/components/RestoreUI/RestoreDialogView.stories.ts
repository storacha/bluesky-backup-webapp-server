import { CredentialSession } from '@atproto/api'
import { fn } from '@storybook/test'

import { RestoreDialogView } from './RestoreDialogView'

import type { Meta, StoryObj } from '@storybook/react'

const sinkSession = {
  did: 'did:key:sinkabc123xyz',
  serviceUrl: new URL('https://atproto.example.com'),
} as CredentialSession

const meta = {
  title: 'components/RestoreDialogView',
  component: RestoreDialogView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    repo: {
      cid: 'abc123',
      accountDid: 'did:key:accountDidasdfj92348j',
      createdAt: new Date(2025, 0, 1),
    },
    snapshotBlobsCount: 3,
    backupBlobsCount: 10,
    loginToSink: fn(),
    restoreRepo: fn(),
    restoreSnapshotBlobs: fn(),
    restoreBackupBlobs: fn(),
  },
  decorators: [],
} satisfies Meta<typeof RestoreDialogView>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {}

export const SinkAuthenticated: Story = {
  args: {
    sinkSession,
  },
}

export const RestoringRepostory: Story = {
  args: {
    sinkSession,
    isRestoringRepo: true,
  },
}

export const RestoringBlobs: Story = {
  args: {
    sinkSession,
    isRestoringSnapshotBlobs: true,
  },
}

export const RestoredRepostory: Story = {
  args: {
    sinkSession,
    isRepoRestored: true,
  },
}

export const RestoredBlobs: Story = {
  args: {
    sinkSession,
    areSnapshotBlobsRestored: true,
  },
}

export const NoSnapshotBlobs: Story = {
  args: {
    sinkSession,
    snapshotBlobsCount: 0,
  },
}

export const NoBackupBlobs: Story = {
  args: {
    sinkSession,
    snapshotBlobsCount: 0,
    backupBlobsCount: 0,
  },
}

export const NoRepo: Story = {
  args: {
    sinkSession,
    repo: undefined,
  },
}
