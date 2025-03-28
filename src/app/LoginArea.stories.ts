import type { Meta, StoryObj } from '@storybook/react'

import { LoginArea } from './LoginArea'

const meta = {
  title: 'Login Area',
  component: LoginArea,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LoginArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    emailAddress: 'timothy-chalamet@gmail.com',
  },
}
Default.storyName = 'Login Area'
