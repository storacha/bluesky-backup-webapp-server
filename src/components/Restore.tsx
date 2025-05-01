'use client'

import dynamic from 'next/dynamic'

export default function Restore({ snapshotId }: { snapshotId: string }) {
  const RestoreUI = dynamic(() => import('./RestoreUI'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
  })
  return <RestoreUI snapshotId={snapshotId} />
}
