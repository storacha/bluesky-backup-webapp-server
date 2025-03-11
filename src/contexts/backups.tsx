'use client'

import type { ReactNode } from "react";
import { createContext, useContext, } from "react";
import { backupMetadataStore, BackupMetadataStore } from "@/lib/backupMetadataStore";

export type BackupsContextProps = {
  backupsStore: BackupMetadataStore;
};

export const BackupsContext = createContext<BackupsContextProps>({
  backupsStore: backupMetadataStore
});

export const BackupsProvider = ({ children }: { children: ReactNode | ReactNode[] }) => (
  <BackupsContext.Provider value={{ backupsStore: backupMetadataStore }}>{children}</BackupsContext.Provider>
)

export const useBackupsContext = () => {
  return useContext(BackupsContext);
};
