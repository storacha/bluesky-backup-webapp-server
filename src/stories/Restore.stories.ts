import type { Meta, StoryObj } from '@storybook/react';

import { RestoreDialogView } from '@/components/RestoreUI';
import { fn } from '@storybook/test';
import { CredentialSession } from '@atproto/api';



const sourceSession = {
  did: 'did:key:sourceabc123xyz',
  pdsUrl: new URL('https://bsky.social')
} as CredentialSession

const sinkSession = {
  did: 'did:key:sinkabc123xyz',
  pdsUrl: new URL('https://atproto.example.com')
} as CredentialSession

const meta = {
  title: 'components/Restore',
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
    sourceSession,
  }
};

export const SinkAuthenticated: Story = {
  args: {
    sourceSession,
    sinkSession,
  }
};

export const RecoveryConfirmationEmailSent: Story = {
  args: {
    sourceSession,
    sinkSession,
    isPlcRestoreAuthorizationEmailSent: true
  }
};

export const PlcRestoreSetup: Story = {
  args: {
    sourceSession,
    sinkSession,
    isPlcRestoreAuthorizationEmailSent: true,
    isPlcRestoreSetup: true
  }
};
