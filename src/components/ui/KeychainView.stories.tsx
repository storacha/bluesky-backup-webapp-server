import { Secp256k1Keypair } from '@atproto/crypto'
import { fn } from '@storybook/test'

import { ProfileData, RotationKey } from '@/types'

import KeychainView from './KeychainView'

import type { Meta, StoryObj } from '@storybook/react'

const keypair = await Secp256k1Keypair.create()

const demorachaAtprotoDid = 'did:plc:ose56ynjv4ahq763rprzah4k'
const createdHereAtprotoDid = 'did:plc:ccoxqh6esjow6cwxt4ww466b'

const profile: ProfileData = {
  handle: 'demoracha.atproto.storacha.network',
  displayName: 'Demo Racha',
  did: demorachaAtprotoDid,
  rotationKeys: [],
  alsoKnownAs: [],
  verificationMethods: {},
  services: {},
}


const key: RotationKey = {
  id: keypair.did(),
  storachaAccount: 'did:mailto:travis:example.com',
  atprotoAccount: demorachaAtprotoDid,
  createdAt: new Date().toLocaleDateString(),
  keypair,
}

const metaOnlyKey = {
  id: keypair.did(),
  storachaAccount: 'did:mailto:travis:example.com',
  atprotoAccount: demorachaAtprotoDid,
  createdAt: new Date().toLocaleDateString(),
}

const createdHereKey: RotationKey = {
  id: keypair.did(),
  storachaAccount: 'did:mailto:travis:example.com',
  atprotoAccount: createdHereAtprotoDid,
  createdAt: new Date().toLocaleDateString(),
  keypair,
}

const keys = [key, metaOnlyKey, createdHereKey]

const meta = {
  title: 'components/KeychainView',
  component: KeychainView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    profile,
    keys,
    generateKeyPair: async () => key,
    setSelectedKey: fn(),
    importKey: fn(),
    forgetKey: fn(),
  },
  decorators: [],
} satisfies Meta<typeof KeychainView>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  args: {
    keys: [],
  },
}

export const WithKeys: Story = {}
