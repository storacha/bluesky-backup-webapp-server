'use server'

import { getStorageContext } from '@/lib/server/db'
import { Did } from '@atproto/oauth-client-node'
import { redirect } from 'next/navigation'

export const action = async (data: FormData) => {
  const { db } = getStorageContext()

  const backupConfig = await db.addBackupConfig({
    // TODO: remove typecasts and do real typechecking and error handling here
    account_did: data.get('account') as string,
    name: (data.get('name') as string) || 'New Config',
    atproto_account: data.get('atproto_account') as Did,
    storacha_space: data.get('storacha_space') as Did<'key'>,
    include_repository: data.get('include_repository') === 'on' ? true : false,
    include_blobs: data.get('include_blobs') === 'on' ? true : false,
    include_preferences:
      data.get('include_preferences') === 'on' ? true : false,
  })

  redirect(`/configs/${backupConfig.id}`) // Redirect to the new config page
}
