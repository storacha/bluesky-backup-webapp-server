import { Secp256k1Keypair } from '@atproto/crypto'
import { fn } from '@storybook/test'

import { RotationKey } from '@/types'

import NewKey from './NewKey'

import type { Meta, StoryObj } from '@storybook/react'

const demorachaAtprotoDid = 'did:plc:ose56ynjv4ahq763rprzah4k'

const keypair = await Secp256k1Keypair.import(
  'abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd',
  { exportable: true }
)
const key: RotationKey = {
  id: keypair.did(),
  storachaAccount: 'did:mailto:travis:example.com',
  atprotoAccount: demorachaAtprotoDid,
  createdAt: new Date().toLocaleDateString(),
  keypair: keypair,
}

const meta = {
  title: 'components/NewKey',
  component: NewKey,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onDone: fn(),
  },
  decorators: [
    // (Story) => (
    //   <Modal isOpen={true} onClose={fn()}>
    //     {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
    //     <Story />
    //   </Modal>
    // ),
  ],
} satisfies Meta<typeof NewKey>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  args: {
    rotationKey: key,
  },
}
