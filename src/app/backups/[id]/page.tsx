import Backup from '@/components/Backup'
import PageLayout from '@/components/PageLayout'

export const runtime = 'edge'

export interface BackupsProps {
  params: Promise<{ id: string }>
}

export default async function Backups({ params }: BackupsProps) {
  const id = parseInt((await params).id)

  return (
    <PageLayout>
      <Backup id={id} />
    </PageLayout>
  )
}
