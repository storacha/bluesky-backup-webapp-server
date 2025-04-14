'use client'

import { useSWR } from '@/app/swr'
import { Form } from '../Form'
import { use } from 'react'
import { Button } from '@/components/ui'
import { createBackup } from './createBackup'
import { useSWRConfig } from 'swr'
import { shortenCID } from '@/lib/ui'
import { useAuthenticator } from '@storacha/ui-react'

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

  return (
    <>
      <Form config={config} />
      <CreateBackupButton configId={config.id} />
      <Backups configId={config.id} />
    </>
  )
}

const CreateBackupButton = ({ configId }: { configId: number }) => {
  const { mutate } = useSWRConfig()

  // TODO: Temporary until real auth is in place
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  if (!account) return null

  const handleClick = async () => {
    await createBackup({ configId, account: account.did() })
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
