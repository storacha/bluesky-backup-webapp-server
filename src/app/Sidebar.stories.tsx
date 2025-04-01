import type { Decorator, Meta, StoryObj } from '@storybook/react'

import { linkTo } from '@storybook/addon-links'
import { SWRConfig } from 'swr'
import { Sidebar } from './Sidebar'

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

const withLinks = (
  data: Record<string, Parameters<typeof linkTo>>
): Decorator =>
  function WithLinksDecorator(Story) {
    return (
      <div
        onClickCapture={(e) => {
          if (e.target instanceof HTMLAnchorElement) {
            e.preventDefault()
            const href = e.target.getAttribute('href')
            if (href && href in data) {
              linkTo(...data[href])()
            } else {
              throw new Error(`No link given in story for ${href}`)
            }
          }
        }}
      >
        <Story />
      </div>
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
