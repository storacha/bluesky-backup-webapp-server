import { Meta, StoryObj } from '@storybook/react'

import PlanSelector from './PlanSelector'

const meta: Meta<typeof PlanSelector> = {
  title: 'components/PlanSelector',
  component: PlanSelector,
}
export default meta

type Story = StoryObj<typeof PlanSelector>

export const Default: Story = {}
