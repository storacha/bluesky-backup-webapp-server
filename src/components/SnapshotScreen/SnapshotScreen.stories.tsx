import { SnapshotScreen } from './SnapshotScreen'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof SnapshotScreen> = {
  title: 'Components/SnapshotScreen',
  component: SnapshotScreen,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = 'SnapshotScreen'
