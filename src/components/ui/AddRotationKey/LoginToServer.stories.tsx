import { fn } from '@storybook/test'

import LoginToServer from './LoginToServer'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'components/AddRotationKey/LoginToServer',
  component: LoginToServer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    server: 'atproto.example.com',
    handle: 'racha.atproto.example.com',
    loginToPDS: fn(),
  },
  decorators: [],
} satisfies Meta<typeof LoginToServer>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  args: {},
}
