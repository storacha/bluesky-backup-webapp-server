import Backup from "@/components/Backup"

export const runtime = 'edge'

export interface BackupsProps {
  params: Promise<{ id: string }>
}

export default async function Backups ({ params }: BackupsProps) {
  const id = parseInt((await params).id)

  return (
    <Backup id={id} />
  )
}
