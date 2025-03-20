import type { Meta, StoryObj } from '@storybook/react';
import Input from '@/components/Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'filled'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    helperText: 'Must be at least 8 characters',
    type: 'password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    value: 'invalid@email',
    error: 'Please enter a valid email address',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    placeholder: 'Outline variant',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    placeholder: 'Filled variant',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled input',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input placeholder="Default variant" />
      <Input variant="outline" placeholder="Outline variant" />
      <Input variant="filled" placeholder="Filled variant" />
    </div>
  ),
};
