import type { Meta, StoryObj } from '@storybook/react'

import { BackupUIView } from '@/components/BackupUI'
import { fn } from '@storybook/test'
import { BskyAuthContextProps } from '@/contexts'
import { Account, ContextState, Space } from '@w3ui/react'
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Blob, PrefsDoc, Repo } from '@/lib/db'

// @ts-expect-error this is fine for now
const space = { did: () => 'did:key:asdfawer' } as Space
// @ts-expect-error this is fine for now
const bluesky = {
  userProfile: {
    did: 'did:plc:abc123',
  } as ProfileViewBasic,
  session: { server: { issuer: 'https://bsky.social' } },
} as BskyAuthContextProps
const storacha = {
  accounts: [{} as Account],
  spaces: [space],
}
const meta = {
  title: 'components/BackupUI',
  component: BackupUIView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    bluesky: {} as BskyAuthContextProps,
    storacha: {} as ContextState,
    space,
    setSelectedSpace: fn(),
    backupEvents: new EventTarget(),
    isBackingUpRepo: false,
    isBackingUpPrefsDoc: false,
    isBackingUpBlobs: false,
    onClickBackupBlobs: fn(),
    onClickBackupRepo: fn(),
    onClickBackupPrefsDoc: fn(),
    onClickInitializeBackup: fn(),
    onClickQuickPublicBackup: fn(),
    encryptRepo: false,
    setEncryptRepo: fn(),
    encryptBlobs: false,
    setEncryptBlobs: fn(),
    encryptPrefsDoc: true,
    setEncryptPrefsDoc: fn(),
  },
  decorators: [],
} satisfies Meta<typeof BackupUIView>

export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {}

export const Authenticated: Story = {
  args: {
    bluesky,
    storacha,
  },
}

export const BackupCreator: Story = {
  args: {
    bluesky,
    storacha,
    currentBackupId: 1,
  },
}

export const BackingUpRepo: Story = {
  args: {
    bluesky,
    storacha,
    currentBackupId: 1,
    isBackingUpRepo: true,
  },
}

export const BackingUpBlobs: Story = {
  args: {
    bluesky,
    storacha,
    currentBackupId: 1,
    isBackingUpBlobs: true,
  },
}

export const BackingUpPrefsDoc: Story = {
  args: {
    bluesky,
    storacha,
    currentBackupId: 1,
    isBackingUpPrefsDoc: true,
  },
}

export const BackedUpRepo: Story = {
  args: {
    bluesky,
    storacha,
    currentBackupId: 1,
    repo: {} as Repo,
  },
}

export const BackedUpBlobs: Story = {
  args: {
    bluesky,
    storacha,
    currentBackupId: 1,
    blobs: [{} as Blob],
  },
}

export const BackedUpPrefsDoc: Story = {
  args: {
    bluesky,
    storacha,
    currentBackupId: 1,
    prefsDoc: {} as PrefsDoc,
  },
}
