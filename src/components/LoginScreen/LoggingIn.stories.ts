import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

import { LoggingIn } from './LoggingIn'

const meta = {
  title: 'LoggingIn',
  component: LoggingIn,
  args: {
    email: 'timothy-chalamet@gmail.com',
    cancelLogin: fn(),
  },
} satisfies Meta<typeof LoggingIn>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = 'LoggingIn'
