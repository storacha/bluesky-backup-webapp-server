'use client'

import dynamic from 'next/dynamic'

import { Spinner } from '../ui'

export default function Restore({ snapshotId }: { snapshotId: string }) {
  const RestoreUI = dynamic(() => import('./RestoreUI'), {
    loading: () => <Spinner />,
    ssr: false,
  })
  return <RestoreUI snapshotId={snapshotId} />
}
