import { BackupScreen } from './BackupScreen'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof BackupScreen> = {
  title: 'Components/BackupScreen',
  component: BackupScreen,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = 'BackupScreen'
