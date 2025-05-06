import { expect, userEvent, within } from '@storybook/test'

import { DataBox } from './DataBox'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'DataBox',
  component: DataBox,
  args: {
    label: 'Awesome mode',
    name: 'awesome_mode',
    description: 'Make everything a lot more awesome',
  },
} satisfies Meta<typeof DataBox>

export default meta

type Story = StoryObj<typeof meta>

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement)
  const dataBox = await canvas.findByTestId('data-box')
  const switchInput = await canvas.findByRole('switch')
  return { dataBox, switchInput }
}

export const ToggleOn: Story = {
  args: {
    defaultSelected: false,
  },
  play: async ({ canvasElement }) => {
    const { dataBox, switchInput } = await getElements(canvasElement)
    await expect(switchInput).not.toBeChecked()
    await userEvent.click(dataBox)
    await expect(switchInput).toBeChecked()
  },
}
export const ToggleOff: Story = {
  args: {
    defaultSelected: true,
  },
  play: async ({ canvasElement }) => {
    const { dataBox, switchInput } = await getElements(canvasElement)
    await expect(switchInput).toBeChecked()
    await userEvent.click(dataBox)
    await expect(switchInput).not.toBeChecked()
  },
}
