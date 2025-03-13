import type { Meta, StoryObj } from '@storybook/react';

import { DashboardPage } from './DashboardPage';
import { Context as StorachaContext } from '@w3ui/react';
import { withReactContext } from 'storybook-react-context'
import { BskyAuthContext as BlueskyContext } from '@/contexts';
import { BackupsContext } from '@/contexts/backups';
import { backupMetadataStore } from '@/lib/backupMetadataStore';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'DashboardPage',
  component: DashboardPage,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: false }
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [{}]
    }),
    withReactContext({
      context: BackupsContext,
      contextValue: { backupsStore: backupMetadataStore }
    })
  ]
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Initialized: Story = {};

export const StorachaAuthenticatedWithBackups: Story = {
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: true, userProfile: {} }
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [{
        accounts: [{
          did: () => "did:mailto:example.com:test",
          toEmail: () => "test@example.com"
        }],
        client: {},
        spaces: [{did: () => "did:key:bafybeiabc123"}]
      }]
    }),
    withReactContext({
      context: BackupsContext,
      contextValue: {
        backupsStore: {
          listBackups: () => [
            {
              id: 1,
              accountDid: "did:plc:bsge7l6c7arbyymas5u7gpiq",
              createdAt: new Date("Wed Mar 05 2025 08:56:36 GMT-0800 (Pacific Standard Time)")
            },
            {
              id: 2,
              accountDid: "did:plc:bsge7l6c7arbyymas5u7gpiq",
              createdAt: new Date("Wed Mar 06 2025 18:43:45 GMT-0800 (Pacific Standard Time)")
            }
          ]
        }
      }
    })
  ]
};