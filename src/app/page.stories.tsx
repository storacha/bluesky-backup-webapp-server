import type { Meta, StoryObj } from '@storybook/react'

import { linkTo } from '@storybook/addon-links'
import { Account } from '@storacha/ui-react'
import Page from './page'
import { withAuthContext } from '@/../.storybook/decorators'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕',
  component: Page,
  parameters: {
    layout: 'fullscreen',
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
