import { Blobs, Repos } from "@/components/Backups"
import Restore from "@/components/Restore"

export const runtime = 'edge'

export interface BackupsProps {
  params: Promise<{ id: string }>
}

export default async function Backups ({ params }: BackupsProps) {
  const id = (await params).id
  
  return (
    <div className="bg-white/80 p-10 h-full min-h-screen">
      <h1 className="text-xl font-mono font-bold uppercase">Backup {id}</h1>
      <Repos backupId={id} className='py-4 w-full' />
      <Blobs backupId={id} className='py-4 w-full' />
      <Restore backupId={id} />
    </div>
  )
}
