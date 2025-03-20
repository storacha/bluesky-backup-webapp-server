'use client'

import { useBackupsContext } from "@/contexts/backups"
import { cidUrl } from "@/lib/storacha"
import { shortenCID, shortenDID } from "@/lib/ui"
import { useLiveQuery } from "dexie-react-hooks"

export function Backups ({ className = '' }: { className?: string }) {
  const { backupsStore } = useBackupsContext()
  const backups = useLiveQuery(() => backupsStore.listBackups())

  return (
    <div className={className}>
      <div className='p-2 bg-white/50 rounded-lg'>
        <table className="table-auto w-full">
          <thead className="text-left">
            <tr>
              <th>
                Backup
              </th>
              <th>
                Account DID
              </th>
              <th>
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {backups?.map((backup) => (
              <tr key={backup.id} className="odd:bg-gray-100/80">
                <td>
                  <a href={`/backups/${backup.id}`}>
                    {backup.id}
                  </a>
                </td>
                <td>
                  <a href={`/backups/${backup.id}`}>
                    {shortenDID(backup.accountDid)}
                  </a>
                </td>
                <td>
                  <a href={`/backups/${backup.id}`}>
                    {backup.createdAt.toDateString()}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Repo ({ backupId, className = '' }: { backupId: number, className?: string }) {
  const { backupsStore } = useBackupsContext()
  const repo = useLiveQuery(() => backupsStore.getRepo(backupId))
  return (
    <div className={className}>
      <h2 className="text-sm font-mono font-bold uppercase mb-2">Repos</h2>
      <div className='p-2 bg-white/50 rounded-lg'>
        <table className="table-auto w-full">
          <thead className="text-left">
            <tr>
              <th>
                Upload CID
              </th>
              <th>
                Repo CID
              </th>
              <th>
                Bluesky Account DID
              </th>
              <th>
                Commit
              </th>
              <th>
                Encrypted With
              </th>
            </tr>
          </thead>
          <tbody>
            {repo && (
              <tr key={repo.cid} className="odd:bg-gray-100/80">
                <td>
                  <a href={cidUrl(repo.cid)}>
                    {shortenCID(repo.cid)}
                  </a>
                </td>
                <td>
                  {repo.repoCid && (
                    <a href={cidUrl(repo.repoCid)}>
                      {shortenCID(repo.repoCid)}
                    </a>
                  )}
                </td>
                <td>
                  {shortenDID(repo.accountDid)}
                </td>
                <td>
                  {repo.commit}
                </td>
                <td>
                  {repo.encryptedWith && shortenDID(repo.encryptedWith)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Prefs ({ backupId, className = '' }: { backupId: number, className?: string }) {
  const { backupsStore } = useBackupsContext()
  const prefsDoc = useLiveQuery(() => backupsStore.getPrefsDoc(backupId))
  return (
    <div className={className}>
      <h2 className="text-sm font-mono font-bold uppercase mb-2">Preferences</h2>
      <div className='p-2 bg-white/50 rounded-lg'>
        <table className="table-auto w-full">
          <thead className="text-left">
            <tr>
              <th>
                CID
              </th>
              <th>
                Bluesky Account DID
              </th>
              <th>
                Encrypted With
              </th>
            </tr>
          </thead>
          <tbody>
            {prefsDoc && (
              <tr key={prefsDoc.cid} className="odd:bg-gray-100/80">
                <td>
                  <a href={cidUrl(prefsDoc.cid)}>
                    {shortenCID(prefsDoc.cid)}
                  </a>
                </td>
                <td>
                  {shortenDID(prefsDoc.accountDid)}
                </td>
                <td>
                  {prefsDoc.encryptedWith && shortenDID(prefsDoc.encryptedWith)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Blobs ({ backupId, className = '' }: { backupId: number, className?: string }) {
  const { backupsStore } = useBackupsContext()
  const blobs = useLiveQuery(() => backupsStore.listBlobs(backupId))
  return (
    <div className={className}>
      <h2 className="text-sm font-mono font-bold uppercase mb-2">Blobs</h2>
      <div className='p-2 bg-white/50 rounded-lg'>
        <table className="table-auto w-full">
          <thead className="text-left">
            <tr>
              <th>
                CID
              </th>
              <th>
                Bluesky Account DID
              </th>
              <th>
                Encrypted With
              </th>
            </tr>
          </thead>
          <tbody>
            {blobs?.map(blob => (
              <tr key={blob.cid} className="odd:bg-gray-100/80">
                <td>
                  <a href={cidUrl(blob.cid)}>
                    {shortenCID(blob.cid)}
                  </a>
                </td>
                <td>
                  {shortenDID(blob.accountDid)}
                </td>
                <td>
                  {blob.encryptedWith && shortenDID(blob.encryptedWith)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}