import { linkTo } from '@storybook/addon-links'

import { LoggingIn } from './LoggingIn'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: LoggingIn,
  args: {
    email: 'timothy-chalamet@gmail.com',
    cancelLogin: linkTo('Components/LoginScreen/LoginForm'),
  },
} satisfies Meta<typeof LoggingIn>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = 'LoggingIn'
