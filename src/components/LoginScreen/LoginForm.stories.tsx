import { linkTo } from '@storybook/addon-links'
import { fn } from '@storybook/test'

import { LoginForm } from './LoginForm'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: LoginForm,
  args: {
    email: 'timothy-chalamet@gmail.com',
    setEmail: fn(),
  },
  decorators: [
    (Story) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          linkTo('Components/LoginScreen/LoggingIn')()
        }}
      >
        <Story />
      </form>
    ),
  ],
} satisfies Meta<typeof LoginForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = 'LoginForm'
