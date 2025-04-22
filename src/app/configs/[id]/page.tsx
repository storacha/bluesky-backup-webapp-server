'use client'

import { use } from 'react'
import { Sidebar } from '@/app/Sidebar'
import * as SpaceBlob from '@storacha/capabilities/space/blob'
import * as SpaceIndex from '@storacha/capabilities/space/index'
import * as Upload from '@storacha/capabilities/upload'
import { useSWR } from '@/app/swr'
import { Button } from '@/components/ui'
import { Form } from '../Form'
import { createBackup } from './createBackup'
import { SERVER_DID } from '@/lib/constants'
import { Capabilities, Client, useAuthenticator } from '@storacha/ui-react'
import { BackupConfig } from '@/app/types'
import { Did } from '@atproto/oauth-client-node'
import { Delegation } from '@ucanto/core'

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
    mutate,
  } = useSWR(['api', '/api/backup-configs'])
  if (error) throw error
  if (!configs) return null

  const config = configs.find((config) => config.id === id)
  if (!config) return null

  return (
    <>
      <Sidebar selectedConfigId={id} />
      <Form config={config} />
      <CreateBackupButton config={config} mutateBackups={mutate} />
      <Backups configId={config.id} />
    </>
  )
}

async function delegate(client: Client, space: Did<'key'>) {
  const issuer = client.agent.issuer

  const capabilities: Capabilities = [
    {
      can: SpaceBlob.add.can,
      with: space,
    },
    {
      can: SpaceIndex.add.can,
      with: space,
    },
    {
      can: Upload.add.can,
      with: space,
    },
  ]

  const delegation = await Delegation.delegate({
    issuer: issuer,
    audience: { did: () => SERVER_DID },
    capabilities,
    proofs: client.proofs(capabilities),
    expiration: new Date(Date.now() + 1000 * 60 * 60).getTime(), // 1 hour
  })

  const result = await delegation.archive()

  if (result.error) {
    throw result.error
  }
  return result.ok
}

const CreateBackupButton = ({
  config,
  mutateBackups,
}: {
  config: BackupConfig
  mutateBackups: () => void
}) => {
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]
  if (!account || !client) {
    return null
  }

  const handleClick = async () => {
    const delegationData = await delegate(client, config.storacha_space)
    await createBackup({ configId: config.id, delegationData })
    mutateBackups()
  }

  return <Button onClick={handleClick}>Create Backup</Button>
}

const Backups = ({ configId }: { configId: number }) => {
  const { data: backups, error: backupsError } = useSWR([
    'api',
    `/api/backup-configs/${configId}/backups`,
  ])

  const { data: blobs, error: blobsError } = useSWR([
    'api',
    `/api/backup-configs/${configId}/blobs`,
  ])

  if (backupsError) throw backupsError
  if (!backups) return null
  if (blobsError) throw backupsError

  return (
    <div>
      <h2>Backups</h2>
      <table>
        <thead>
          <tr>
            <th>Created</th>
            <th>Repository</th>
            <th>Blobs</th>
            <th>Preferences</th>
          </tr>
        </thead>
        <tbody>
          {backups.map((backup) => (
            <tr key={backup.id}>
              <td>{backup.created_at}</td>
              <td>
                {backup.repository_status} <br />
                {backup.repository_cid ? backup.repository_cid : '—'}
              </td>
              <td>
                {backup.blobs_status} <br />
                {blobs?.filter((b) => b.backup_id === backup.id).length ?? 0}
              </td>
              <td>
                {backup.preferences_status} <br />
                {backup.preferences_cid ? backup.preferences_cid : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
