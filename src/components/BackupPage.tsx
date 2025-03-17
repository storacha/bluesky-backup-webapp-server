import React from 'react'

import PageLayout from '@/components/PageLayout'
import Backup from '@/components/Backup'

export const BackupPage = ({ id }: { id: number }) => {
  return (
    <PageLayout>
      <Backup id={id} />
    </PageLayout>
  )
}
