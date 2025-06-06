import { Secp256k1Keypair } from '@atproto/crypto'
import { fn } from '@storybook/test'

import { ProfileData, RotationKey } from '@/types'

import RotationKeyStatus from './RotationKeyStatus'

import type { Meta, StoryObj } from '@storybook/react'

const demorachaAtprotoDid = 'did:plc:ose56ynjv4ahq763rprzah4k'

const profile: ProfileData = {
  handle: 'demoracha.atproto.storacha.network',
  displayName: 'Demo Racha',
  did: demorachaAtprotoDid,
  rotationKeys: [],
  alsoKnownAs: [],
  verificationMethods: {},
  services: {},
}

const keypair = await Secp256k1Keypair.import(
  'abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd'
)
const key: RotationKey = {
  id: keypair.did(),
  storachaAccount: 'did:mailto:travis:example.com',
  atprotoAccount: demorachaAtprotoDid,
  createdAt: new Date().toLocaleDateString(),
  keypair: keypair,
}

const metaOnlyKeypair = await Secp256k1Keypair.import(
  '1234123412341234123412341234123412341234123412341234123412341234'
)
const metaOnlyKey = {
  id: metaOnlyKeypair.did(),
  storachaAccount: 'did:mailto:travis:example.com',
  atprotoAccount: demorachaAtprotoDid,
  createdAt: new Date().toLocaleDateString(),
}

const meta = {
  title: 'components/RotationKeyStatus',
  component: RotationKeyStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    profile,
    onDone: fn(),
    hydrateKey: fn(),
  },
  decorators: [],
} satisfies Meta<typeof RotationKeyStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  args: {
    rotationKey: key
  },
}

export const MetaOnly: Story = {
  args: {
    rotationKey: metaOnlyKey
  },
}

