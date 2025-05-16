import { Account } from '@storacha/ui-react'
import { linkTo } from '@storybook/addon-links'

import { withAuthContext } from '@/../.storybook/decorators'

import { modes } from '../../.storybook/modes'

import Page from './page'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕',
  component: Page,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      modes: modes(['default', 'iphone16']),
    },
  },
  decorators: [
    (Story) => (
      <div
        onSubmitCapture={(e) => {
          e.preventDefault()
          linkTo('Pages/∕', 'Logged In')()
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  decorators: [
    withAuthContext({
      client: undefined,
    }),
  ],
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
    withAuthContext(
      {
        accounts: [
          {
            did: () => 'did:mailto:gmail.com:timothy-chalamet',
            toEmail: () => 'timothy-chalamet@gmail.com',
          } as unknown as Account,
        ],
      },
      {
        async logout() {
          linkTo('Pages/∕', 'Logged Out')()
        },
      }
    ),
  ],
}
