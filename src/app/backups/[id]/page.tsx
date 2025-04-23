'use client'

import { use } from 'react'
import { Sidebar } from '@/app/Sidebar'
import { useSWR } from '@/app/swr'
import { BackupScreen } from '@/components/Backup/index'

export default function Config({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = use(params)
  const id = parseInt(idParam)
  // TODO: Should we fetch individual configs? We already need the list for the
  // sidebar, and they're not heavy so far, but we should check back on this at
  // the end of the first version.
  const {
    data: configs,
    error,
  } = useSWR(['api', '/api/backups'])
  if (error) throw error
  if (!configs) return null

  const config = configs.find((config) => config.id === id)
  if (!config) return null

  return (
    <>
      <Sidebar selectedConfigId={id} />
      <BackupScreen config={config}/>
    </>
  )
}


