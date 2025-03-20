import type { Meta, StoryObj } from '@storybook/react';
import Button from '@/components/Button';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    isLoading: { control: 'boolean' },
    isFullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    isFullWidth: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Left Icon',
    leftIcon: <ArrowRightIcon className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Right Icon',
    rightIcon: <ChevronDownIcon className="h-4 w-4" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Both Icons',
    leftIcon: <ArrowRightIcon className="h-4 w-4" />,
    rightIcon: <ChevronDownIcon className="h-4 w-4" />,
  },
};

export const IconOnly: Story = {
  args: {
    leftIcon: <ArrowRightIcon className="h-4 w-4" />,
    'aria-label': 'Next',
  },
};
