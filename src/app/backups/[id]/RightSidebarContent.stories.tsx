import { SpaceBlob, SpaceIndex, Upload } from '@storacha/capabilities'
import { Account, Space } from '@storacha/ui-react'
import { Delegation } from '@ucanto/core'
import { Capabilities, Signer } from '@ucanto/principal/ed25519'

import { withAuthContext, withData } from '@/../.storybook/decorators'
import { SERVER_DID } from '@/lib/constants'

import { RightSidebarContent } from './RightSidebarContent'

import type { Meta, StoryObj } from '@storybook/react'

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

const meta = {
  // Uses division slash (∕) instead of regular slash (/) in the title.
  title: '∕backups∕[id]/RightSidebarContent',
  component: RightSidebarContent,
  parameters: {
    parentSize: {
      width: '300px',
    },
    backgrounds: {
      default: 'Backup',
    },
  },
  args: {
    backup: {
      id: 'abc',
      accountDid: 'did:mailto:gmail.com:timothy-chalamet',
      name: 'Backup #1',
      atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
      storachaSpace: 'did:key:zMw6cW3gpcPQzNkdfprbTZZh2MajkgZ3MdbqgUsqmksvBPiz',
      includeRepository: true,
      includeBlobs: true,
      includePreferences: false,
      delegationCid:
        'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551dele',
      paused: false,
      archived: false,
    },
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
      ],
    }),
    withData(['api', '/api/backups/abc/snapshots'], {
      count: 0,
      next: null,
      prev: null,
      results: [],
    }),
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
        expiration: Math.floor(Date.now() / 1000) + 100000,
      })
    ),
  ],
} satisfies Meta<typeof RightSidebarContent>

export default meta
type Story = StoryObj<typeof meta>

export const WithNoSnapshots: Story = {}

export const WithSnapshots: Story = {
  decorators: [
    withData(['api', '/api/backups/abc/snapshots'], {
      count: 2,
      next: null,
      prev: null,
      results: [
        {
          id: 'abc',
          backupId: 'abc',
          atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          repositoryStatus: 'success',
          repositoryCid:
            'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551repo',
          blobsStatus: 'in-progress',
          preferencesStatus: 'not-started',
          createdAt: '2025-04-07 19:51:56',
        },
        {
          id: 'def',
          backupId: 'abc',
          atprotoAccount: 'did:plc:ro3eio7zgqosf5gnxsq6ik5m',
          repositoryStatus: 'not-started',
          blobsStatus: 'in-progress',
          preferencesStatus: 'success',
          preferencesCid:
            'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy552pref',
          createdAt: '2025-04-07 20:51:56',
        },
      ],
    }),
  ],
}

export const WithLoadingDelegation: Story = {
  decorators: [
    withData(
      [
        'delegation',
        { cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551dele' },
      ],
      new Promise(() => {})
    ),
  ],
}

export const WithNotFoundDelegation: Story = {
  decorators: [
    withData(
      [
        'delegation',
        { cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551dele' },
      ],
      new Error('Delegation not found')
    ),
  ],
}

export const WithExpiredDelegation: Story = {
  decorators: [
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
}
