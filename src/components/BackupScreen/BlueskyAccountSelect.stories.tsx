import { userEvent, within } from '@storybook/test'

import { withData } from '../../../.storybook/decorators'

import { BlueskyAccountSelect } from './BlueskyAccountSelect'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof BlueskyAccountSelect> = {
  title: 'Components/BlueskyAccountSelect',
  component: BlueskyAccountSelect,
  parameters: {
    parentSize: {
      width: '300px',
    },
    backgrounds: {
      default: 'Backup',
    },
  },
  args: {
    name: 'atproto_account',
  },
  decorators: [
    withData(
      ['api', '/api/atproto-accounts'],
      [
        'did:plc:e7qrxsmiso3gz655qknfgoio',
        'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
        // One that we fail to look up a profile/handle for:
        'did:plc:xk5qfoqe5szn63giisr7moog',
      ]
    ),
    withData(['atproto-profile', 'did:plc:e7qrxsmiso3gz655qknfgoio'], {
      did: 'did:plc:e7qrxsmiso3gz655qknfgoio',
      handle: 'wonkadonk.bsky.social',
      rotationKeys: [],
      alsoKnownAs: [],
      services: {},
      verificationMethods: {},
    }),
    withData(['atproto-profile', 'did:plc:ro3eio7zgqosf5gnxsq6ik5m'], {
      did: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
      handle: 'chalametoui.bsky.social',
      displayName: 'Timmy C.',
      rotationKeys: [],
      alsoKnownAs: [],
      services: {},
      verificationMethods: {},
    }),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const ShowingHandle: Story = {
  args: {
    defaultValue: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByRole('button')
    await userEvent.click(button)
  },
}
