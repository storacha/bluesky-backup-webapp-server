import { Account, Space } from '@storacha/ui-react'

import { withAuthContext, withData } from '@/../.storybook/decorators'

import Page from './page'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕backups∕new',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    withAuthContext({
      accounts: [
        {
          did: () => 'did:mailto:gmail.com:timothy-chalamet',
          toEmail: () => 'timothy-chalamet@gmail.com',
        } as unknown as Account,
      ],
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
    withData(
      ['api', '/api/atproto-accounts'],
      ['did:plc:ro3eio7zgqosf5gnxsq6ik5m', 'did:plc:vv44vwwbr3lmbjht3p5fd7wz']
    ),
    withData(
      ['atproto-handle', 'did:plc:ro3eio7zgqosf5gnxsq6ik5m'],
      'chalametoui.bsky.social'
    ),
    withData(
      ['atproto-handle', 'did:plc:vv44vwwbr3lmbjht3p5fd7wz'],
      'isupposeichal.bsky.social'
    ),
    withData(
      ['api', '/api/backups'],
      [
        {
          id: 1,
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Backup #1',
          atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          storachaSpace:
            'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
          delegationCid: null,
          includeRepository: true,
          includeBlobs: true,
          includePreferences: false,
        },
        {
          id: 2,
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Bluesky #452',
          atprotoAccount: 'did:plc:vv44vwwbr3lmbjht3p5fd7wz',
          storachaSpace:
            'did:key:zMwdHTDrZWDPyrEA2GLc3nnBTXcAn6RN3Lexio45ULK56BXA',
          delegationCid: null,
          includeRepository: false,
          includeBlobs: false,
          includePreferences: true,
        },
      ]
    ),
  ],
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
Default.storyName = '∕backups∕new'
