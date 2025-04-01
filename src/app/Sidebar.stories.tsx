import type { Decorator, Meta, StoryObj } from '@storybook/react'

import { Sidebar } from './Sidebar'
import { SWRConfig } from 'swr'

const withFullViewportHeight: Decorator = (Story) => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <Story />
  </div>
)

const withData = (data: Record<string, unknown>): Decorator =>
  function WithDataDecorator(Story) {
    return (
      <SWRConfig
        value={{
          // Provide a local cache, so it doesn't persist between stories.
          provider: () => new Map(),
          async fetcher(resource) {
            if (resource in data) {
              return data[resource]
            } else {
              throw new Error(`No data given in story for ${resource}`)
            }
          },
        }}
      >
        <Story />
      </SWRConfig>
    )
  }

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
