import type { Meta, StoryObj } from '@storybook/react'

import { KeychainView } from '@/components/Keychain'
import { fn } from '@storybook/test'

const keyPair = {
  publicKey: {} as CryptoKey,
  PrivateKey: {} as CryptoKey,
  did: () => 'did:key:keypair',
  toSecret: async () => "secret secret, I've got a secret!",
}

const key = {
  id: keyPair.did(),
  symkeyCid: 'bafybeigreable',
  keyPair,
}

const publicOnlyKeyPair = {
  publicKey: {} as CryptoKey,
  did: () => 'did:key:publiconlykeypair',
}

const publicOnlyKey = {
  id: publicOnlyKeyPair.did(),
  symkeyCid: 'bafybeipublicgrawf34af4',
  keyPair: publicOnlyKeyPair,
}

const metaOnlyKey = {
  id: 'did:key:metaonlykeypair',
  symkeyCid: 'bafybeimetagreableawfani',
}

const meta = {
  title: 'components/KeychainView',
  component: KeychainView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    keys: [],
    generateKeyPair: async () => publicOnlyKey,
    setSelectedKey: fn(),
    importKey: fn(),
    forgetKey: fn(),
  },
  decorators: [],
} satisfies Meta<typeof KeychainView>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {}

export const WithKeys: Story = {
  args: {
    keys: [publicOnlyKey, key, metaOnlyKey],
  },
}
