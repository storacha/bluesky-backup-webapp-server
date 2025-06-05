import { Account } from '@storacha/ui-react'
import { linkTo } from '@storybook/addon-links'

import { withAuthContext, withData } from '@/../.storybook/decorators'

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
      modes: modes(['desktop', 'iphone16']),
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

const timothy = {
  did: () => 'did:mailto:gmail.com:timothy-chalamet',
  toEmail: () => 'timothy-chalamet@gmail.com',
} as unknown as Account

export const Loading: Story = {
  decorators: [
    withAuthContext({
      client: undefined,
    }),
  ],
}

export const LoggedOut: Story = {
  parameters: {
    chromatic: {
      modes: {
        ...meta.parameters.chromatic.modes,
        // Demonstrate how the footer lays out on a tall desktop screen.
        ...modes(['desktop-tall']),
      },
    },
  },
  decorators: [
    withAuthContext({
      accounts: [],
      submitted: false,
    }),
  ],
}

export const LoggedInNoPlan: Story = {
  decorators: [
    withAuthContext(
      {
        accounts: [timothy],
      },
      {
        async logout() {
          linkTo('Pages/∕', 'Logged Out')()
        },
      }
    ),
    withData(['storacha-plan', timothy], undefined),
  ],
}

export const LoggedInWithPlan: Story = {
  decorators: [
    withAuthContext(
      {
        accounts: [timothy],
      },
      {
        async logout() {
          linkTo('Pages/∕', 'Logged Out')()
        },
      }
    ),
    withData(['storacha-plan', timothy], 'the-super-awesome-plan'),
  ],
}
