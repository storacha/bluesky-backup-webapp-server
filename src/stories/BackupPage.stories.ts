import type { Meta, StoryObj } from '@storybook/react';

import { BackupPage } from './BackupPage';
import { Context as StorachaContext } from '@w3ui/react';
import { withReactContext } from 'storybook-react-context'
import { BskyAuthContext as BlueskyContext } from '@/contexts';
import { BackupsContext } from '@/contexts/backups';

const meta = {
  title: 'BackupPage',
  component: BackupPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    id: 1
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
      contextValue: {
        backupsStore: {
          listRepos: async () => [
            {
              backupId: 1,
              cid: 'bafybeiabc123',
              uploadCid: 'bafybeixyx987',
              accountDid: 'did:plc:awiflawnfelaibgl'
            }
          ],
          listBlobs: async () => [
            {
              backupId: 1,
              cid: 'bafybeilmn465',
              accountDid: 'did:plc:awiflawnfelaibgl'
            }
          ]
        }
      }
    })
  ]
} satisfies Meta<typeof BackupPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Initialized: Story = {};
