import { CredentialSession } from '@atproto/api'
import { fn } from '@storybook/test'

import { RestoreDialogView } from './RestoreDialogView'

import type { Meta, StoryObj } from '@storybook/react'

const sinkSession = {
  did: 'did:key:sinkabc123xyz',
  serviceUrl: new URL('https://atproto.example.com'),
} as CredentialSession

const meta = {
  title: 'components/Restore',
  component: RestoreDialogView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    loginToSink: fn(),
    restoreRepo: fn(),
    restoreBlobs: fn(),
  },
  decorators: [],
} satisfies Meta<typeof RestoreDialogView>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {}

export const SinkAuthenticated: Story = {
  args: {
    sinkSession,
  },
}
