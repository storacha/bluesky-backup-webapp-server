import { SpaceBlob, SpaceIndex, Upload } from '@storacha/capabilities'
import { Account } from '@storacha/ui-react'
import { Delegation } from '@ucanto/core'
import { Capabilities, Signer } from '@ucanto/principal/ed25519'

import { SERVER_DID } from '@/lib/constants'

import {
  withAuthContext,
  withData,
  withLinks,
} from '../../.storybook/decorators'

import { Sidebar } from './Sidebar'

import type { Decorator, Meta, StoryObj } from '@storybook/react'

const timothy = {
  did: () => 'did:mailto:gmail.com:timothy-chalamet',
  toEmail: () => 'timothy-chalamet@gmail.com',
} as unknown as Account

const withFullViewportHeight: Decorator = (Story) => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <Story />
  </div>
)

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    withFullViewportHeight,
    withData(['api', '/api/backups'], []),
    // @ts-expect-error the Fetchable typing issue strikes again
    withData(['api', '/api/backups/archived'], []),
    withLinks({
      '/backups/new': ['Pages/∕backups∕new'],
      '/backups/1': ['Pages/∕backups∕[id]'],
      '/backups/2': ['Pages/∕backups∕[id]'],
    }),
    withAuthContext({ accounts: [timothy] }),
    withData(['storacha-plan', timothy], 'the-super-awesome-plan'),
  ],
  args: {
    selectedBackupId: null,
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

export const WithNoPlan: Story = {
  decorators: [withData(['storacha-plan', timothy], undefined)],
}

export const NoBackups: Story = {}

const spaceSigner = await Signer.generate()

const capabilities: Capabilities = [
  {
    can: SpaceBlob.add.can,
    with: spaceSigner.did(),
  },
  {
    can: SpaceIndex.add.can,
    with: spaceSigner.did(),
  },
  {
    can: Upload.add.can,
    with: spaceSigner.did(),
  },
]
export const WithBackups: Story = {
  decorators: [
    withData(
      ['api', '/api/backups'],
      [
        {
          id: 'abc',
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Backup #1',
          atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          storachaSpace:
            'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
          includeRepository: true,
          includeBlobs: true,
          includePreferences: false,
          delegationCid: null,
          paused: false,
          archived: false,
        },
        {
          id: 'def',
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'Bluesky #452',
          atprotoAccount: 'did:plc:vv44vwwbr3lmbjht3p5fd7wz',
          storachaSpace:
            'did:key:zMwdHTDrZWDPyrEA2GLc3nnBTXcAn6RN3Lexio45ULK56BXA',
          includeRepository: false,
          includeBlobs: false,
          includePreferences: true,
          delegationCid: null,
          paused: false,
          archived: false,
        },
        {
          id: 'ghi',
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'A Paused Backup',
          atprotoAccount: 'did:plc:vv44vwwbr3lmbjht3p5fd7wz',
          storachaSpace:
            'did:key:zMwdHTDrZWDPyrEA2GLc3nnBTXcAn6RN3Lexio45ULK56BXA',
          includeRepository: false,
          includeBlobs: false,
          includePreferences: true,
          delegationCid: null,
          paused: true,
          archived: false,
        },
        {
          id: 'ghi',
          accountDid: 'did:mailto:gmail.com:timothy-chalamet',
          name: 'An Expired Backup',
          atprotoAccount: 'did:plc:vv44vwwbr3lmbjht3p5fd7wz',
          storachaSpace:
            'did:key:zMwdHTDrZWDPyrEA2GLc3nnBTXcAn6RN3Lexio45ULK56BXA',
          includeRepository: false,
          includeBlobs: false,
          includePreferences: true,
          delegationCid:
            'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551dele',
          paused: false,
          archived: false,
        },
      ]
    ),
    withData(
      [
        'delegation',
        { cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551dele' },
      ],
      Delegation.delegate({
        issuer: spaceSigner,
        audience: { did: () => SERVER_DID },
        capabilities,
        proofs: [],
        expiration: Math.floor(Date.now() / 1000) - 1,
      })
    ),
  ],
  args: {
    selectedBackupId: 'abc',
  },
}

export const WhileBackupsLoading: Story = {
  decorators: [withData(['api', '/api/backups'], new Promise(() => {}))],
  args: {
    selectedBackupId: 'abc',
  },
}
