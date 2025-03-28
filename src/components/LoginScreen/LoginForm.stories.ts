import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

import { LoginForm } from './LoginForm'

const meta = {
  title: 'LoginForm',
  component: LoginForm,
  args: {
    email: 'timothy-chalamet@gmail.com',
    setEmail: fn(),
  },
} satisfies Meta<typeof LoginForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = 'LoginForm'
