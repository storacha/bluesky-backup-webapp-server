'use client'

import dynamic from 'next/dynamic'

import { FullscreenLoader } from '../Loader'

export default function Restore({ snapshotId }: { snapshotId: string }) {
  const RestoreUI = dynamic(() => import('./RestoreUI'), {
    loading: () => <FullscreenLoader />,
    ssr: false,
  })
  return <RestoreUI snapshotId={snapshotId} />
}
