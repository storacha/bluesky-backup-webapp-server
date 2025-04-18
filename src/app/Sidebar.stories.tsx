import type { Decorator, Meta, StoryObj } from '@storybook/react'

import { Sidebar } from './Sidebar'
import { withData, withLinks } from '../../.storybook/decorators'

const withFullViewportHeight: Decorator = (Story) => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <Story />
  </div>
)

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    withFullViewportHeight,
    withData(['api', '/api/backup-configs'], []),
    withLinks({
      '/configs/new': ['Pages/∕configs∕new'],
      '/configs/1': ['Pages/∕configs∕[id]'],
      '/configs/2': ['Pages/∕configs∕[id]'],
    }),
  ],
  args: {
    selectedConfigId: null,
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

export const NoBackupConfigs: Story = {}

export const WithBackupConfigs: Story = {
  decorators: [
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
        {
          id: 2,
          account_did: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Bluesky #452',
          bluesky_account: 'did:plc:vv44vwwbr3lmbjht3p5fd7wz',
          storacha_space:
            'did:key:zMwdHTDrZWDPyrEA2GLc3nnBTXcAn6RN3Lexio45ULK56BXA',
          include_repository: false,
          include_blobs: false,
          include_preferences: true,
        },
      ]
    ),
  ],
  args: {
    selectedConfigId: 1,
  },
}

export const WhileBackupConfigsLoading: Story = {
  decorators: [withData(['api', '/api/backup-configs'], new Promise(() => {}))],
  args: {
    selectedConfigId: 1,
  },
}
