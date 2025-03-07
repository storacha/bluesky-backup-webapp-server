'use client'

import dynamic from 'next/dynamic'

export default function Restore ({ backupId }: { backupId: string }) {
  const RestoreUI = dynamic(() => import('./RestoreUI'), {
    loading: () => <p>Loading...</p>,
    ssr: false
  })
  return (
    <RestoreUI backupId={backupId} />
  )
}