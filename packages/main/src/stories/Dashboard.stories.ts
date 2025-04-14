import type { Meta, StoryObj } from '@storybook/react'

import { Dashboard } from '../components/Dashboard'
import { Context as StorachaContext } from '@w3ui/react'
import { withReactContext } from 'storybook-react-context'
import { BskyAuthContext as BlueskyContext } from '@/contexts'
import { BackupsContext } from '@/contexts/backups'
import { backupMetadataStore } from '@/lib/backupMetadataStore'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Dashboard',
  component: Dashboard,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: false, authenticated: false },
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [{}],
    }),
    withReactContext({
      context: BackupsContext,
      contextValue: { backupsStore: backupMetadataStore },
    }),
  ],
} satisfies Meta<typeof Dashboard>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Uninitialized: Story = {}

export const BlueskyUnautheticated: Story = {
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: false },
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [{}],
    }),
  ],
}

export const StorachaUnauthenticated: Story = {
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: true },
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [
        {
          accounts: [],
          client: {},
        },
      ],
    }),
  ],
}

export const StorachaAuthenticated: Story = {
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: true, userProfile: {} },
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [
        {
          accounts: [
            {
              did: () => 'did:mailto:example.com:test',
              toEmail: () => 'test@example.com',
              plan: { get: () => ({ ok: null }) },
            },
          ],
          client: {},
          spaces: [],
        },
      ],
    }),
  ],
}

export const StorachaAuthenticatedWithPlan: Story = {
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: true, userProfile: {} },
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [
        {
          accounts: [
            {
              did: () => 'did:mailto:example.com:test',
              toEmail: () => 'test@example.com',
              plan: { get: () => ({ ok: { product: 'did:web:test' } }) },
            },
          ],
          client: {},
          spaces: [],
        },
      ],
    }),
  ],
}

export const StorachaAuthenticatedWithSpaces: Story = {
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: true, userProfile: {} },
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [
        {
          accounts: [
            {
              did: () => 'did:mailto:example.com:test',

              toEmail: () => 'test@example.com',
              plan: { get: () => ({ ok: { product: 'did:web:test' } }) },
            },
          ],
          client: {},
          spaces: [{ did: () => 'did:key:bafybeiabc123' }],
        },
      ],
    }),
  ],
}

export const StorachaAuthenticatedWithBackups: Story = {
  decorators: [
    withReactContext({
      context: BlueskyContext,
      contextValue: { initialized: true, authenticated: true, userProfile: {} },
    }),
    withReactContext({
      context: StorachaContext,
      contextValue: [
        {
          accounts: [
            {
              did: () => 'did:mailto:test:example.com',
              plan: { get: () => ({ ok: { product: 'did:web:test' } }) },
            },
          ],
          client: {},
          spaces: [{ did: () => 'did:key:bafybeiabc123' }],
        },
      ],
    }),
    withReactContext({
      context: BackupsContext,
      contextValue: {
        backupsStore: {
          listBackups: () => [
            {
              id: 1,
              accountDid: 'did:plc:bsge7l6c7arbyymas5u7gpiq',
              createdAt: new Date(
                'Wed Mar 05 2025 08:56:36 GMT-0800 (Pacific Standard Time)'
              ),
            },
            {
              id: 2,
              accountDid: 'did:plc:bsge7l6c7arbyymas5u7gpiq',
              createdAt: new Date(
                'Wed Mar 06 2025 18:43:45 GMT-0800 (Pacific Standard Time)'
              ),
            },
          ],
        },
      },
    }),
  ],
}
