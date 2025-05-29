import { BackupDetail } from './BackupDetail'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof BackupDetail> = {
  title: 'Components/BackupDetail',
  component: BackupDetail,
  parameters: {
    backgrounds: {
      default: 'Backup',
    },
  },
}

export default meta

type Story = StoryObj<typeof BackupDetail>

export const CreateBackup: Story = {}

export const ShowBackup: Story = {
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
      delegationCid: null,
      paused: false,
    },
  },
}
