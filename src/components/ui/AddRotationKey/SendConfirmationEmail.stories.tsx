import { fn } from '@storybook/test'

import SendConfirmationEmail from './SendConfirmationEmail'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'components/AddRotationKey/SendConfirmationEmail',
  component: SendConfirmationEmail,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    server: 'atproto.example.com',
    onDone: fn(),
  },
  decorators: [],
} satisfies Meta<typeof SendConfirmationEmail>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  args: {},
}
