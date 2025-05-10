import { KeychainProvider } from '@/contexts/keychain'

import Keychain from './Keychain'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'components/Keychain',
  component: Keychain,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    atprotoAccount: 'did:plc:ose56ynjv4ahq763rprzah4k',
  },
  decorators: [
    (Story) => (
      <KeychainProvider>
        <Story />
      </KeychainProvider>
    ),
  ],
} satisfies Meta<typeof Keychain>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {}
