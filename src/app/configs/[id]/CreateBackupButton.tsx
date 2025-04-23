'use client';
import { BackupConfig } from '@/app/types';
import { Button } from '@/components/ui';
import { useAuthenticator } from '@storacha/ui-react';
import { createBackup } from './createBackup';
import { delegate } from './delegate';


export const CreateBackupButton = ({
  config, mutateBackups,
}: {
  config: BackupConfig;
  mutateBackups: () => void;
}) => {
  const [{ accounts, client }] = useAuthenticator();
  const account = accounts[0];
  if (!account || !client) {
    return null;
  }

  const handleClick = async () => {
    const delegationData = await delegate(client, config.storachaSpace);
    await createBackup({ configId: config.id, delegationData });
    mutateBackups();
  };

  return <Button onClick={handleClick}>Create Backup</Button>;
};
