import { Account, Space } from '@storacha/ui-react'

import { withAuthContext, withData } from '@/../.storybook/decorators'

import Page from './SnapshotPage'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '/snapshots∕[id]',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    id: 'abc',
  },
  decorators: [
    withAuthContext({
      accounts: [
        {
          did: () => 'did:mailto:gmail.com:timothy-chalamet',
          toEmail: () => 'timothy-chalamet@gmail.com',
        } as unknown as Account,
      ],
      spaces: [
        {
          name: 'Important Stuff',
          did: () => 'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
        } as unknown as Space,
      ],
    }),
    withData(
      ['api', '/api/backups'],
      [
        {
          id: 'abc',
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Backup #1',
          atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          storachaSpace:
            'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
          delegationCid: 'abc123',
          includeRepository: true,
          includeBlobs: true,
          includePreferences: false,
        },
      ]
    ),
    withData(['api', '/api/snapshots/abc'], {
      id: 'abc',
      backupId: 'abc',
      atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
      repositoryStatus: 'success',
      repositoryCid:
        'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551repo',
      blobsStatus: 'in-progress',
      preferencesStatus: 'not-started',
      createdAt: '2025-04-07 19:51:56',
    }),
    withData(
      ['atproto-handle', 'did:plc:ro3eio7zgqosf5gnxsq6ik5m'],
      'chalametoui.bsky.social'
    ),
  ],
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = '/snapshots∕[id]'
