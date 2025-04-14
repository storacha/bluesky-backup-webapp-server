import type { Meta, StoryObj } from '@storybook/react'
import Dropdown from '@/components/Dropdown'
import {
  ArrowRightIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'

const meta = {
  title: 'UI/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
    },
  },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

const defaultItems = [
  {
    label: 'Edit',
    icon: <PencilIcon />,
    onClick: () => console.log('Edit clicked'),
  },
  {
    label: 'Duplicate',
    icon: <DocumentDuplicateIcon />,
    onClick: () => console.log('Duplicate clicked'),
  },
  {
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => console.log('Delete clicked'),
    disabled: true,
  },
]

export const Primary: Story = {
  args: {
    items: defaultItems,
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    items: defaultItems,
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    items: defaultItems,
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    items: defaultItems,
    variant: 'ghost',
  },
}

export const CustomTrigger: Story = {
  args: {
    items: defaultItems,
    trigger: (
      <div className="flex items-center">
        Custom Trigger
        <ArrowRightIcon className="ml-2 h-4 w-4" />
      </div>
    ),
  },
}

export const LeftAligned: Story = {
  args: {
    items: defaultItems,
    align: 'left',
  },
}

export const CenterAligned: Story = {
  args: {
    items: defaultItems,
    align: 'center',
  },
}
