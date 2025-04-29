'use client'

import { createContext, useContext } from 'react'
import {
  backupMetadataStore,
  BackupMetadataStore,
} from '@/lib/backupMetadataStore'

type BackupsContextProps = {
  backupsStore: BackupMetadataStore
}

const BackupsContext = createContext<BackupsContextProps>({
  backupsStore: backupMetadataStore,
})

export const useBackupsContext = () => {
  return useContext(BackupsContext)
}
