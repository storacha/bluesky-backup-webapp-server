import { Blobs, Prefs, Repo } from "@/components/Backups"
import Restore from "@/components/Restore"

export default function Backup ({ id }: { id: number }) {
  return (
    <div className="flex flex-col space-y-4 items-start mt-16">
      <div className="bg-white/80 p-10 w-full rounded border border-bluesky-blue">
        <h2 className="text-xl font-mono font-bold uppercase">Backup {id}</h2>
        <Repo backupId={id} className='py-4 w-full' />
        <Prefs backupId={id} className='py-4 w-full' />
        <Blobs backupId={id} className='py-4 w-full' />
      </div>
      <div className="bg-white/80 p-10 h-full min-h-screen w-full rounded border border-bluesky-blue">
        <h2 className="text-xl font-mono font-bold uppercase">Restore</h2>
        <h5 className="">To restore this backup, please log in to your current and new ATProto servers:</h5>
        <Restore backupId={id} />
      </div>
    </div>
  )
}