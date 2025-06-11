import { Account, Space } from '@storacha/ui-react'

import { withAuthContext, withData } from '@/../.storybook/decorators'

import Page from './BackupPage'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕backups∕[id]',
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
    withData(['api', '/api/backups/abc'], {
      id: 'abc',
      accountDid: 'did:mailto:gmail.com:timothy-chalamet',
      name: 'Backup #1',
      atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
      storachaSpace: 'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
      includeRepository: true,
      includeBlobs: true,
      includePreferences: false,
      delegationCid: null,
      paused: false,
      archived: false,
    }),
    withData(['api', '/api/backups/abc/snapshots'], { count: 0, results: [] }),
  ],
} satisfies Meta<typeof Page>

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
          repositoryUploadCid:
            'bafybeigdyrzalji2f8a9f8lha3iuhglag498hal359a8h3l4g9a8h1repo',
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

export const Paused: Story = {
  decorators: [
    withData(['api', '/api/backups'], ([backup]) => {
      if (!backup) throw new Error('Expected a backup from earlier data')
      return [
        {
          ...backup,
          paused: true,
        },
      ]
    }),
  ],
}
