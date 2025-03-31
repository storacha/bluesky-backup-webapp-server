import type { Decorator, Meta, StoryObj } from '@storybook/react'

import { Sidebar } from './Sidebar'

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
  decorators: [withFullViewportHeight],
  args: {
    backupConfigs: [],
    selectedConfig: null,
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>
export const NoBackupConfigs: Story = {}

export const WithBackupConfigs: Story = {
  args: {
    backupConfigs: ['Backup #1', 'Bluesky #452'],
    selectedConfig: 'Backup #1',
  },
}
