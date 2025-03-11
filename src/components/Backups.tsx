'use client'

import { useBackupsContext } from "@/contexts/backups"
import { Backup, Blob, Repo } from "@/lib/db"
import { shortenCID, shortenDID } from "@/lib/ui"
import { useLiveQuery } from "dexie-react-hooks"

export function Backups ({ className = '' }: { className?: string }) {
  const { backupsStore } = useBackupsContext()
  const backups = useLiveQuery<Backup[]>(() => backupsStore.listBackups())

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

export function Repos ({ backupId, className = '' }: { backupId: number, className?: string }) {
  const { backupsStore } = useBackupsContext()
  const repos = useLiveQuery<Repo[]>(() => backupsStore.listRepos(backupId))
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
            </tr>
          </thead>
          <tbody>
            {repos?.map(repo => (
              <tr key={repo.cid} className="odd:bg-gray-100/80">
                <td>
                  <a href={`https://w3s.link/ipfs/${repo.uploadCid}`}>
                    {shortenCID(repo.uploadCid)}
                  </a>
                </td>
                <td>
                  <a href={`https://w3s.link/ipfs/${repo.cid}`}>
                    {shortenCID(repo.cid)}
                  </a>
                </td>
                <td>
                  {shortenDID(repo.accountDid)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Blobs ({ backupId, className = '' }: { backupId: number, className?: string }) {
  const { backupsStore } = useBackupsContext()
  const blobs = useLiveQuery<Blob[]>(() => backupsStore.listBlobs(backupId))
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
            </tr>
          </thead>
          <tbody>
            {blobs?.map(blob => (
              <tr key={blob.cid} className="odd:bg-gray-100/80">
                <td>
                  <a href={`https://w3s.link/ipfs/${blob.cid}`}>
                    {shortenCID(blob.cid)}
                  </a>
                </td>
                <td>
                  {shortenDID(blob.accountDid)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}