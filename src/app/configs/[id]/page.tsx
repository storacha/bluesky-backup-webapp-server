'use client'

import { useSWR } from '@/app/swr'
import { Form } from '../Form'
import { use } from 'react'

export default function Config({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // TODO: Should we fetch individual configs? We already need the list for the
  // sidebar, and they're not heavy so far, but we should check back on this at
  // the end of the first version.
  const { data: configs, error } = useSWR(['api', '/api/backup-configs'])
  if (error) throw error
  if (!configs) return null

  const config = configs.find((config) => config.id === parseInt(id))
  if (!config) return null

  return <Form config={config} />
}
