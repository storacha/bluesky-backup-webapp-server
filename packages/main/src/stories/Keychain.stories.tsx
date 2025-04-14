import type { Meta, StoryObj } from '@storybook/react'

import Keychain from '@/components/Keychain'
import { KeychainProvider } from '@/contexts/keychain'
import { Context as StorachaContext } from '@w3ui/react'
import { withReactContext } from 'storybook-react-context'

const meta = {
  title: 'components/Keychain',
  component: Keychain,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {},
  decorators: [
    (Story) => (
      <KeychainProvider>
        <Story />
      </KeychainProvider>
    ),
    withReactContext({
      context: StorachaContext,
      contextValue: [{ client: { uploadFile: () => 'bafybagbei' } }],
    }),
  ],
} satisfies Meta<typeof Keychain>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {}
