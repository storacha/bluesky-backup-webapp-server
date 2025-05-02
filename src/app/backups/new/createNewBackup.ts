'use server'
import { Did } from '@atproto/oauth-client-node'
import { redirect } from 'next/navigation'

import { getStorageContext } from '@/lib/server/db'

export const action = async (data: FormData) => {
  const { db } = getStorageContext()
  const atprotoAccount = data.get('atproto_account') as Did

  if (!atprotoAccount) {
    throw new Error('ATProto account not provided')
  }

  if (!atprotoAccount.startsWith('did:')) {
    throw new Error('Invalid ATProto account format - must start with "did:"')
  }

  const backup = await db.addBackup({
    accountDid: data.get('account') as string,
    name: (data.get('name') as string) || 'New Backup',
    atprotoAccount: atprotoAccount,
    storachaSpace: data.get('storacha_space') as Did<'key'>,
    includeRepository: data.get('include_repository') === 'on' ? true : false,
    includeBlobs: data.get('include_blobs') === 'on' ? true : false,
    includePreferences: data.get('include_preferences') === 'on' ? true : false,
    delegationCid: data.get('delegation_cid') as string,
  })

  redirect(`/backups/${backup.id}`)
}
