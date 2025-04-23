import type { Meta, StoryObj } from '@storybook/react'

import Page from './page'
import { withAuthContext, withData } from '@/../.storybook/decorators'
import { Account, Space } from '@storacha/ui-react'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕configs∕[id]',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    params: Promise.resolve({
      id: '1',
    }),
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
          id: 1,
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Backup #1',
          atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          storachaSpace:
            'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
          includeRepository: true,
          includeBlobs: true,
          includePreferences: false,
        },
      ]
    ),
    withData(
      ['api', '/api/backups/1/snapshots'],
      [
        {
          id: 1,
          backupId: 1,
          repositoryStatus: 'success',
          repositoryCid:
            'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551repo',
          blobsStatus: 'in-progress',
          preferencesStatus: 'not-started',
          createdAt: '2025-04-07 19:51:56',
        },
        {
          id: 2,
          backupId: 1,
          repositoryStatus: 'not-started',
          blobsStatus: 'in-progress',
          preferencesStatus: 'success',
          preferencesCid:
            'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy552pref',
          createdAt: '2025-04-07 20:51:56',
        },
      ]
    ),
    withData(
      ['atproto-handle', 'did:plc:ro3eio7zgqosf5gnxsq6ik5m'],
      'chalametoui.bsky.social'
    ),
  ],
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = '∕configs∕[id]'
