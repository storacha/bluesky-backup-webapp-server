import type { Meta, StoryObj } from '@storybook/react'

import Page from './page'
import { withAuthContext } from '@/../.storybook/decorators'
import { Space } from '@storacha/ui-react'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕configs∕new',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    withAuthContext({
      spaces: [
        {
          name: 'Important Stuff',
          did: () => 'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
        } as unknown as Space,
        {
          name: 'Pretty Useless Stuff, Actually',
          did: () => 'did:key:zMwdHTDrZWDPyrEA2GLc3nnBTXcAn6RN3Lexio45ULK56BXA',
        } as unknown as Space,
      ],
    }),
  ],
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = '∕configs∕new'
