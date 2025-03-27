import type { Meta, StoryObj } from '@storybook/react'

import Page from './page'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = '∕'
