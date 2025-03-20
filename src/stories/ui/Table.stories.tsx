import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/Table';

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['simple', 'striped'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const SampleData = [
  { 
    backupId: 'backup_01',
    handle: 'jay.bsky.social',
    did: 'did:plc:7iza6de2p63z3uxr7zjj2w5n',
    createdAt: '2024-01-15T09:23:45Z',
    carSize: '156.3 MB',
    status: 'Synced',
  },
  { 
    backupId: 'backup_02',
    handle: 'alice.bsky.team',
    did: 'did:plc:q6jy2idwyi3mnkqxqt6d7e7d',
    createdAt: '2024-01-14T15:30:22Z',
    carSize: '89.7 MB',
    status: 'Pending',
  },
  { 
    backupId: 'backup_03',
    handle: 'bob.bsky.social',
    did: 'did:plc:ragtjsm2j2vknr3wypswmr3n',
    createdAt: '2024-01-13T22:15:10Z',
    carSize: '234.1 MB',
    status: 'Failed',
  },
];

export const Simple: Story = {
  render: () => (
    <Table className="min-w-[800px]">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Backup ID</TableHeaderCell>
          <TableHeaderCell>Handle</TableHeaderCell>
          <TableHeaderCell>DID</TableHeaderCell>
          <TableHeaderCell>Created At</TableHeaderCell>
          <TableHeaderCell>Size</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SampleData.map((row) => (
          <TableRow key={row.backupId}>
            <TableCell className="font-mono">{row.backupId}</TableCell>
            <TableCell>@{row.handle}</TableCell>
            <TableCell className="font-mono text-xs text-gray-600">{row.did}</TableCell>
            <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
            <TableCell>{row.carSize}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Striped: Story = {
  render: () => (
    <Table variant="striped" className="min-w-[800px]">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Backup ID</TableHeaderCell>
          <TableHeaderCell>Handle</TableHeaderCell>
          <TableHeaderCell>DID</TableHeaderCell>
          <TableHeaderCell>Created At</TableHeaderCell>
          <TableHeaderCell>Size</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SampleData.map((row) => (
          <TableRow key={row.backupId}>
            <TableCell className="font-mono">{row.backupId}</TableCell>
            <TableCell>@{row.handle}</TableCell>
            <TableCell className="font-mono text-xs text-gray-600">{row.did}</TableCell>
            <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
            <TableCell>{row.carSize}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCustomCells: Story = {
  render: () => (
    <Table className="min-w-[800px]">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Backup ID</TableHeaderCell>
          <TableHeaderCell>Handle</TableHeaderCell>
          <TableHeaderCell>DID</TableHeaderCell>
          <TableHeaderCell>Created At</TableHeaderCell>
          <TableHeaderCell>Size</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SampleData.map((row) => (
          <TableRow key={row.backupId}>
            <TableCell>
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                {row.backupId}
              </code>
            </TableCell>
            <TableCell>
              <a 
                href={`https://bsky.app/profile/${row.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-bluesky-blue)] hover:underline"
              >
                @{row.handle}
              </a>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-gray-600 break-all">
                {row.did}
              </span>
            </TableCell>
            <TableCell>
              {new Date(row.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>{row.carSize}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                row.status === 'Synced' 
                  ? 'bg-green-100 text-green-700' 
                  : row.status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {row.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
