import { expect, fn, userEvent, within } from '@storybook/test'

import { Select } from './Select'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    parentSize: {
      width: '300px',
    },
    backgrounds: {
      values: [
        {
          name: 'Backup',
          value: 'var(--color-light-blue-10)',
        },
      ],
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
    actionLabel: 'Connect Bluesky account…',
    actionOnPress: fn(),
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
  play: async ({ canvasElement, args }) => {
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
      name: 'Connect Bluesky account…',
    })
    await userEvent.click(option)
    // expect the action to be called
    await expect(args.actionOnPress).toHaveBeenCalled()
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
