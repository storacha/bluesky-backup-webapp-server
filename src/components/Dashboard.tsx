'use client'

import React from 'react';

import { useBskyAuthContext } from '@/contexts';
import { Loader } from '@/components/Loader';
import StorachaAuthenticator from '@/components/StorachaAuthenticator';
import BlueskyAuthenticator from '@/components/BlueskyAuthenticator';
import { useW3 } from '@w3ui/react';
import BackupUI from '@/components/BackupUI';
import { useBackupsContext } from '@/contexts/backups';
import { useLiveQuery } from 'dexie-react-hooks';
import { Backups } from '@/components/Backups';
import { usePlan } from '@/app/hooks';
import StripePricingTable from '@/components/StripePricingTable';

export const Dashboard = () => {
  const bluesky = useBskyAuthContext()
  const [storacha] = useW3()
  const { backupsStore } = useBackupsContext()
  const backups = useLiveQuery(() => backupsStore.listBackups())
  const storachaAccount = storacha.accounts?.[0]
  const { data, isLoading: planIsLoading } = usePlan(storachaAccount)
  const plan = data?.product
  return (
    <div className="flex flex-col space-y-4 items-start mt-16">
      <div className="bg-white/80 backdrop-blur-3xl p-16 rounded border border-bluesky-blue">
        {bluesky.initialized ? (
          bluesky.authenticated ? (
            storachaAccount ? (
              planIsLoading ? (
                <div className="w-100">
                  <Loader />
                </div>
              ) : (
                plan ? (
                  <BackupUI />
                ) : (
                  <div className="min-w-5xl">
                    Sign up for a Storacha plan to continue!
                    <StripePricingTable />
                  </div>
                )
              )
            ) : (
              <div className="flex flex-col items-center">
                <h4 className="mb-4 font-bold">Next, please log in to your Storacha account:</h4>
                <StorachaAuthenticator />
              </div>
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
          <div className="w-100">
            <Loader />
          </div>
        )}
      </div>
      <div className="w-full bg-white/80 backdrop-blur-3xl p-16 rounded border border-bluesky-blue">
        <h2 className="font-mono font-bold uppercase mb-2">Backups</h2>
        {backups ? (backups.length > 0 ? (
          <Backups />
        ) : (
          <span>You have not yet created any backups.</span>
        )) : (
          // we should wrap loader in a container with a fixed width
          // to avoid layout-shifts
          <div className="w-100">
            <Loader />
          </div>
        )}
      </div>
    </div>
  )
};
