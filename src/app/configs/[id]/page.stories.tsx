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
      ['api', '/api/backup-configs'],
      [
        {
          id: 1,
          account_did: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Backup #1',
          bluesky_account: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          storacha_space:
            'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
          include_repository: true,
          include_blobs: true,
          include_preferences: false,
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
