import { Loader } from './Loader'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Loader,
  decorators: [],
} satisfies Meta<typeof Loader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [],
}
Default.storyName = 'Loader'
