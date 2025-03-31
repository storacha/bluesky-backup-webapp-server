import type { Meta, StoryObj, Decorator } from '@storybook/react'

import { fn } from '@storybook/test'
import {
  Account,
  AuthenticatorContext,
  AuthenticatorContextValue,
} from '@storacha/ui-react'
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

function withAuthContext(
  state: Partial<AuthenticatorContextValue[0]>
): Decorator {
  return function WithAuthContext(Story) {
    return (
      <AuthenticatorContext.Provider
        value={[
          {
            accounts: [],
            spaces: [],
            email: '',
            submitted: false,
            ...state,
          },
          {
            setEmail: fn(),
            cancelLogin: fn(),
            logout: fn(),
          },
        ]}
      >
        <Story />
      </AuthenticatorContext.Provider>
    )
  }
}

export const LoggedOut: Story = {
  decorators: [
    withAuthContext({
      accounts: [],
      submitted: false,
    }),
  ],
}

export const LoggedIn: Story = {
  decorators: [
    withAuthContext({
      accounts: [
        {
          toEmail: () => 'timothy-chalamet@gmail.com',
        } as unknown as Account,
      ],
    }),
  ],
}
