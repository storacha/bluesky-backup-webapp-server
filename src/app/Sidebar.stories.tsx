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
    withData(['api', '/api/backups'], []),
    withLinks({
      '/backups/new': ['Pages/∕backups∕new'],
      '/backups/1': ['Pages/∕backups∕[id]'],
      '/backups/2': ['Pages/∕backups∕[id]'],
    }),
  ],
  args: {
    selectedConfigId: null,
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

export const NoBackups: Story = {}

export const WithBackups: Story = {
  decorators: [
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
        {
          id: 2,
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Bluesky #452',
          atprotoAccount: 'did:plc:vv44vwwbr3lmbjht3p5fd7wz',
          storachaSpace:
            'did:key:zMwdHTDrZWDPyrEA2GLc3nnBTXcAn6RN3Lexio45ULK56BXA',
          includeRepository: false,
          includeBlobs: false,
          includePreferences: true,
        },
      ]
    ),
  ],
  args: {
    selectedConfigId: 1,
  },
}

export const WhileBackupsLoading: Story = {
  decorators: [withData(['api', '/api/backups'], new Promise(() => {}))],
  args: {
    selectedConfigId: 1,
  },
}
