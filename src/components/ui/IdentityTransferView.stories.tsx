import { CredentialSession } from '@atproto/api'
import { fn } from '@storybook/test'

import { ProfileData } from '@/types'

import IdentityTransferView from './IdentityTransferView'

import type { Meta, StoryObj } from '@storybook/react'

const demorachaAtprotoDid = 'did:plc:ose56ynjv4ahq763rprzah4k'

const sinkSession = {
  did: 'did:key:sinkabc123xyz',
  serviceUrl: new URL('https://atproto.example.com'),
} as CredentialSession

const profile: ProfileData = {
  handle: 'demoracha.atproto.storacha.network',
  displayName: 'Demo Racha',
  did: demorachaAtprotoDid,
  rotationKeys: [],
  alsoKnownAs: [],
  verificationMethods: {},
  services: {},
}

const meta = {
  title: 'components/IdentityTransferView',
  component: IdentityTransferView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    profile,
    createAccount: fn(),
    loginToSink: fn(),
    transferIdentity: fn(),
  },
  decorators: [],
} satisfies Meta<typeof IdentityTransferView>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {}

export const LoggedIn: Story = {
  args: {
    sinkSession,
  },
}

export const TransferringIdentity: Story = {
  args: {
    sinkSession,
    isTransferringIdentity: true,
  },
}

export const IdentityTransferred: Story = {
  args: {
    sinkSession,
    isIdentityTransferred: true,
  },
}
