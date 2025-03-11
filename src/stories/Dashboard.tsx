'use client'

import React from 'react';

import './button.css';
import { useBskyAuthContext } from '@/contexts';
import { Loader } from '@/components/Loader';
import StorachaAuthenticator from '@/components/StorachaAuthenticator';
import BlueskyAuthenticator from '@/components/BlueskyAuthenticator';
import { useW3 } from '@w3ui/react';
import BackupUI from '@/components/BackupUI';
import { useBackupsContext } from '@/contexts/backups';
import { useLiveQuery } from 'dexie-react-hooks';
import { Backups } from '@/components/Backups';

export const Dashboard = () => {
  const bluesky = useBskyAuthContext()
  const [storacha] = useW3()
  const { backupsStore } = useBackupsContext()
  const backups = useLiveQuery(() => backupsStore.listBackups())
  return (
    <div className="flex flex-col space-y-4 items-start mt-16">
      <div className="bg-white/80 backdrop-blur-3xl p-16 rounded border border-bluesky-blue">
        {bluesky.initialized ? (
          bluesky.authenticated ? (
            storacha.accounts?.[0] ? (
              <BackupUI />
            ) : (
              <StorachaAuthenticator />
            )
          ) : (
            <div>
              <h3 className="text-2xl font-bold mb-16">Welcome to <span className="text-storacha-red">HOT</span> Bluesky Backups by Storacha!</h3>
              <div className="flex flex-col items-center">
                <h4 className="mb-4 font-bold">To get started, please log in to your Bluesky account:</h4>
                <BlueskyAuthenticator />
              </div>
            </div>
          )
        ) : (
          <Loader />
        )}
      </div>
      <div className="w-full bg-white/80 backdrop-blur-3xl p-16 rounded border border-bluesky-blue">
        <h2 className="font-mono font-bold uppercase mb-2">Backups</h2>
        {backups ? (backups.length > 0 ? (
          <Backups />
        ) : (
          <span>You have not yet created any backups.</span>
        )) : (
          <Loader />
        )}
      </div>
    </div>
  )
};
