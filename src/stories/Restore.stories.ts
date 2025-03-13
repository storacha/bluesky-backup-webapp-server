import type { Meta, StoryObj } from '@storybook/react';

import { RestoreDialogView } from '@/components/RestoreUI';
import { fn } from '@storybook/test';
import { CredentialSession } from '@atproto/api';

const meta = {
  title: 'Restore',
  component: RestoreDialogView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    loginToSource: fn(),
    loginToSink: fn(),
    createAccount: fn(),
    restoreRepo: fn(),
    restoreBlobs: fn(),
    restorePrefsDoc: fn(),
    transferIdentity: fn(),
    sendPlcRestoreAuthorizationEmail: fn(),
    setupPlcRestore: fn()
  },
  decorators: [
  ]
} satisfies Meta<typeof RestoreDialogView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {};

export const SourceAuthenticated: Story = {
  args: {
    sourceSession: {} as CredentialSession
  }
};

export const SinkAuthenticated: Story = {
  args: {
    sourceSession: {} as CredentialSession,
    sinkSession: {} as CredentialSession
  }
};

export const RecoveryConfirmationEmailSent: Story = {
  args: {
    sourceSession: {} as CredentialSession,
    sinkSession: {} as CredentialSession,
    isPlcRestoreAuthorizationEmailSent: true
  }
};

export const PlcRestoreSetup: Story = {
  args: {
    sourceSession: {} as CredentialSession,
    sinkSession: {} as CredentialSession,
    isPlcRestoreAuthorizationEmailSent: true,
    isPlcRestoreSetup: true
  }
};
