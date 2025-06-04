import { Did } from '@atproto/api'
import { isDidPlc } from '@atproto/oauth-client-node'

import { AppLayout } from '@/app/AppLayout'
import { findAuthedBskyAccounts } from '@/lib/atproto'
import { getStorageContext, KVNamespace } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

import IdentityPage from './IdentityPage'

async function bskyAccountConnectedToStorachaAccount(
  authSessions: KVNamespace,
  bskyAccount: Did,
  storachaAccount: string
) {
  const bskyAccounts = await findAuthedBskyAccounts(
    authSessions,
    storachaAccount
  )
  return bskyAccounts.includes(bskyAccount)
}

export default async function Identity({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const atprotoDid = decodeURIComponent(id)
  if (!isDidPlc(atprotoDid))
    return new Response('id must be a did:plc', { status: 400 })
  const { authSessionStore } = getStorageContext()
  const { did: storachaAccount } = await getSession()
  if (
    !(await bskyAccountConnectedToStorachaAccount(
      authSessionStore,
      atprotoDid,
      storachaAccount
    ))
  ) {
    return <div>unauthorized</div>
  }
  return (
    <AppLayout selectedBackupId={null}>
      <IdentityPage atprotoDid={atprotoDid} />
    </AppLayout>
  )
}
