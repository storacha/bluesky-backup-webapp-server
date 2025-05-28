import { withData } from '@/../.storybook/decorators'

import { RightSidebarContent } from './RightSidebarContent'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕backups∕[id]/RightSidebarContent',
  component: RightSidebarContent,
  parameters: {
    parentSize: {
      width: '300px',
    },
    backgrounds: {
      default: 'Backup',
    },
  },
  args: {
    backup: {
      id: 'abc',
      accountDid: 'did:mailto:gmail.com:timothy-chalamet',
      name: 'Backup #1',
      atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
      storachaSpace: 'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
      includeRepository: true,
      includeBlobs: true,
      includePreferences: false,
      delegationCid:
        'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551dele',
      paused: false,
    },
  },
  decorators: [
    withData(['api', '/api/backups/abc/snapshots'], {
      count: 0,
      next: null,
      prev: null,
      results: [],
    }),
  ],
} satisfies Meta<typeof RightSidebarContent>

export default meta
type Story = StoryObj<typeof meta>

export const WithNoSnapshots: Story = {}

export const WithSnapshots: Story = {
  decorators: [
    withData(['api', '/api/backups/abc/snapshots'], {
      count: 2,
      next: null,
      prev: null,
      results: [
        {
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
        {
          id: 'def',
          backupId: 'abc',
          atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          repositoryStatus: 'not-started',
          blobsStatus: 'in-progress',
          preferencesStatus: 'success',
          preferencesCid:
            'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy552pref',
          createdAt: '2025-04-07 20:51:56',
        },
      ],
    }),
  ],
}
