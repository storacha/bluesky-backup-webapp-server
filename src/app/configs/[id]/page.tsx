'use client'

import { useSWR } from '@/app/swr'
import { Form } from '../Form'
import { use } from 'react'
import { Sidebar } from '@/app/Sidebar'
import { Button } from '@/components/ui'
import { createBackup } from './createBackup'
import { useSWRConfig } from 'swr'
import { shortenCID } from '@/lib/ui'

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
  const { data: configs, error } = useSWR(['api', '/api/backup-configs'])
  if (error) throw error
  if (!configs) return null

  const config = configs.find((config) => config.id === id)
  if (!config) return null

  return (
    <>
      <Sidebar selectedConfigId={id} />
      <Form config={config} />
      <CreateBackupButton configId={config.id} />
      <Backups configId={config.id} />
    </>
  )
}

const CreateBackupButton = ({ configId }: { configId: number }) => {
  const { mutate } = useSWRConfig()

  const handleClick = async () => {
    await createBackup()
    mutate(['api', `/api/backup-configs/${configId}/backups`])
  }

  return <Button onClick={handleClick}>Create Backup</Button>
}

const Backups = ({ configId }: { configId: number }) => {
  const { data: backups, error } = useSWR([
    'api',
    `/api/backup-configs/${configId}/backups`,
  ])
  if (error) throw error
  if (!backups) return null

  return (
    <div>
      <h2>Backups</h2>
      <table>
        <thead>
          <tr>
            <th>Created</th>
            <th>Repository CID</th>
            <th>Blobs CID</th>
            <th>Preferences CID</th>
          </tr>
        </thead>
        <tbody>
          {backups.map((backup) => (
            <tr key={backup.id}>
              <td>{backup.created_at}</td>
              <td>{shortenCID(backup.repository_cid)}</td>
              <td>{shortenCID(backup.blobs_cid)}</td>
              <td>{shortenCID(backup.preferences_cid)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
