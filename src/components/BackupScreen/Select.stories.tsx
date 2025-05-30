import { expect, fn, userEvent, within } from '@storybook/test'

import { ActionButton } from '../ActionButton'

import { Select } from './Select'

import type { Meta, StoryObj } from '@storybook/react'

const actionOnPress = fn()

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    parentSize: {
      width: '300px',
    },
    backgrounds: {
      default: 'Backup',
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/Lbzwo4ulF1yjgYEITUz3vV/Storacha?node-id=417-102715',
    },
  },
  args: {
    name: 'atproto_account',
    imageSrc: '/bluesky.png',
    label: 'Bluesky account',
    items: [
      {
        id: 'did:plc:e7qrxsmiso3gz655qknfgoio',
        label: 'wonkadonk.bsky.social',
      },
      {
        id: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
        label: 'chalametoui.bsky.social',
      },
    ],
    actionButton: (
      <ActionButton
        actionLabel="Connect Bluesky account..."
        actionOnPress={actionOnPress}
      />
    ),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const NoValue: Story = {}

export const NoValueHover: Story = {
  parameters: { pseudo: { hover: true } },
}

export const NoValueFocus: Story = {
  play: async () => {
    // Focus the button (including :focus-visible)
    await userEvent.tab()
  },
}

export const ValueSelected: Story = {
  play: async ({ canvasElement }) => {
    // Use the entire body to find things in portals outside the canvas element.
    const body = within(canvasElement.ownerDocument.body)
    const button = await body.findByRole('button', {
      name: 'Select Bluesky account',
    })
    await userEvent.click(button)
    const popup = await body.findByRole('dialog', {
      name: 'Select Bluesky account',
    })
    const option = await within(popup).findByRole('option', {
      name: 'chalametoui.bsky.social',
    })
    await userEvent.click(option)

    const htmlSelect = canvasElement.querySelector(
      'select[name="atproto_account"]'
    ) as HTMLSelectElement | null
    expect(htmlSelect?.value).toBe('did:plc:ro3eio7zgqosf5gnxsq6ik5m')
  },
}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByRole('button')
    await userEvent.click(button)
  },
}

export const WithNoOptions: Story = {
  args: {
    items: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByRole('button')
    await userEvent.click(button)
  },
}

export const PerformingTheAction: Story = {
  play: async ({ canvasElement }) => {
    // Use the entire body to find things in portals outside the canvas element.
    const body = within(canvasElement.ownerDocument.body)
    const button = await body.findByRole('button', {
      name: 'Select Bluesky account',
    })
    await userEvent.click(button)
    const popup = await body.findByRole('dialog', {
      name: 'Select Bluesky account',
    })
    const option = await within(popup).findByRole('button', {
      name: 'Connect Bluesky account...',
    })
    await userEvent.click(option)
    // expect the action to be called
    await expect(actionOnPress).toHaveBeenCalled()
  },
}

export const LongValue: Story = {
  args: {
    items: [
      {
        id: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
        label: 'john-jacob-jingleheimer-schmidt.bsky.social',
      },
    ],
    defaultSelectedKey: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
  },
}

export const Disabled: Story = {
  args: {
    isDisabled: true,
    defaultSelectedKey: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByRole('button')
    expect(button).toBeDisabled()
  },
}
