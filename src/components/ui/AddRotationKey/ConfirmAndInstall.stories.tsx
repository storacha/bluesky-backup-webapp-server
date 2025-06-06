import { fn } from '@storybook/test'

import ConfirmAndInstall from './ConfirmAndInstall'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'components/AddRotationKey/ConfirmAndInstall',
  component: ConfirmAndInstall,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    installRecoveryKey: fn(),
  },
  decorators: [],
} satisfies Meta<typeof ConfirmAndInstall>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  args: {},
}
