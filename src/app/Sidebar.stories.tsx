import type { Decorator, Meta, StoryObj } from '@storybook/react'

import { withLinks } from '@storybook/addon-links'
import { Sidebar } from './Sidebar'
import { withData } from '../../.storybook/decorators'

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
    withData({
      '/api/backup-configs': {
        backupConfigs: [],
      },
    }),
    withLinks({
      '/configs/new': ['Pages/∕', 'Logged In'],
    }),
  ],
  args: {
    selectedConfig: null,
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

export const NoBackupConfigs: Story = {}

export const WithBackupConfigs: Story = {
  decorators: [
    withData({
      '/api/backup-configs': {
        backupConfigs: ['Backup #1', 'Bluesky #452'],
      },
    }),
  ],
  args: {
    selectedConfig: 'Backup #1',
  },
}

export const WhileBackupConfigsLoading: Story = {
  decorators: [
    withData({
      '/api/backup-configs': new Promise(() => {}),
    }),
  ],
  args: {
    selectedConfig: 'Backup #1',
  },
}
