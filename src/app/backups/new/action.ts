'use server'

import { getStorageContext } from '@/lib/server/db'
import { Did } from '@atproto/oauth-client-node'
import { redirect } from 'next/navigation'

export const action = async (data: FormData) => {
  const { db } = getStorageContext()

  const backup = await db.addBackup({
    // TODO: remove typecasts and do real typechecking and error handling here
    accountDid: data.get('account') as string,
    name: (data.get('name') as string) || 'New Backup',
    atprotoAccount: data.get('atproto_account') as Did,
    storachaSpace: data.get('storacha_space') as Did<'key'>,
    includeRepository: data.get('include_repository') === 'on' ? true : false,
    includeBlobs: data.get('include_blobs') === 'on' ? true : false,
    includePreferences: data.get('include_preferences') === 'on' ? true : false,
  })

  redirect(`/backups/${backup.id}`) // Redirect to the new backup page
}
