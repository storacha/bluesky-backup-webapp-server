'use client'

import React from 'react'

import { useBskyAuthContext } from '@/contexts'
import { Loader } from '@/components/Loader'
import StorachaAuthenticator from '@/components/StorachaAuthenticator'
import BlueskyAuthenticator from '@/components/BlueskyAuthenticator'
import { useW3 } from '@w3ui/react'
import BackupUI from '@/components/BackupUI'
import { useBackupsContext } from '@/contexts/backups'
import { useLiveQuery } from 'dexie-react-hooks'
import { Backups } from '@/components/Backups'
import { usePlan } from '@/app/hooks'
import StripePricingTable from '@/components/StripePricingTable'
import Image from 'next/image'

export const Dashboard = () => {
  const bluesky = useBskyAuthContext()
  const [storacha] = useW3()
  const { backupsStore } = useBackupsContext()
  const backups = useLiveQuery(() => backupsStore.listBackups())
  const storachaAccount = storacha.accounts?.[0]
  const { data, isLoading: planIsLoading } = usePlan(storachaAccount)
  const plan = data?.product
  return (
    <div className="flex flex-col space-y-4 items-center mt-16">
      <div className="bg-white/80 backdrop-blur-3xl p-16 rounded border border-bluesky-blue flex flex-col items-center">
        {bluesky.initialized ? (
          bluesky.authenticated ? (
            storachaAccount ? (
              planIsLoading ? (
                <div className="w-100">
                  <Loader />
                </div>
              ) : plan ? (
                <BackupUI />
              ) : (
                <div className="min-w-5xl">
                  Sign up for a Storacha plan to continue!
                  <StripePricingTable />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center">
                <h4 className="mb-4 font-bold">
                  Next, please log in to your Storacha account:
                </h4>
                <StorachaAuthenticator />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center space-y-4 max-w-xl">
              <div className="flex flex-col items-center space-y-2 mb-8">
                <h4 className="text-xl font-bold">Welcome to</h4>
                <h3 className="text-3xl font-bold text-storacha-red">
                  <span className="text-storacha-red">HOT HOT HOT</span>
                </h3>
                <h3 className="text-3xl font-bold text-bluesky-blue">
                  Bluesky Backups
                </h3>
                <div className="flex flex-row space-x-2 items-center mt-4">
                  <h4 className="text-lg text-storacha-red">by</h4>
                  <Image
                    src="/wordmark.png"
                    alt="Storacha"
                    height="60"
                    width="168"
                    className="-mt-5"
                  />
                </div>
              </div>
              <div className="prose-sm text-center">
                <p className="font-bold text-base">
                  Back up your Bluesky data 💾 !
                </p>
                <p>
                  We&apos;ll help you <b>encrypt</b> it 🔐 to keep it safe, and
                  archive 🏢 it to the <b>Filecoin Network</b> for extreme
                  durability 🦾.
                </p>
                <p>
                  If you&apos;d like to migrate 🦆 to a new{' '}
                  <b>Bluesky Personal Data Server</b> we&apos;ll help you
                  decrypt your backup 🔓, load it into the new server 🚚 and
                  then transfer your identity by providing <b>cryptographic</b>{' '}
                  proof 🕵️ to your old server that <b>you&apos;ve moved!</b>
                </p>
                <p>
                  ‼️ Please note ‼️ This service should be considered
                  &ldquo;early alpha&rdquo; and definitely has some rough edges.
                </p>
                <p>
                  If you&apos;d like to contribute 💪 to its development
                  we&apos;d love to see 👀 you at{' '}
                  <a
                    className="underline text-bluesky-blue font-bold"
                    href="https://github.com/storacha/bluesky-backup-webapp/"
                  >
                    github.com/storacha/bluesky-backup-webapp/
                  </a>
                </p>
                <p className="font-bold text-base">
                  To get started, please log in to your Bluesky account:
                </p>
              </div>
              <div className="flex flex-col items-center w-full">
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
        {backups ? (
          backups.length > 0 ? (
            <Backups />
          ) : (
            <span>You have not yet created any backups.</span>
          )
        ) : (
          // we should wrap loader in a container with a fixed width
          // to avoid layout-shifts
          <div className="w-100">
            <Loader />
          </div>
        )}
      </div>
    </div>
  )
}
