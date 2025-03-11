'use client'

import { backupMetadataStore } from "../lib/backupMetadataStore";
import BackupButton from "./BackupButton";

export default function BackupUI () {
  return (
    <BackupButton backupMetadataStore={backupMetadataStore} />
  )
}
