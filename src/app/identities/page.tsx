import { findAuthedBskyAccounts } from '@/lib/atproto'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

import IdentitiesPage from './IdentitiesPage'

// we need this here because of the call to findAuthedBskyAccounts which uses secrets only available at runtime
export const dynamic = 'force-dynamic'

export default async function Identities() {
  const { did: account } = await getSession()
  const { authSessionStore } = getStorageContext()
  const accounts = await findAuthedBskyAccounts(authSessionStore, account)

  return <IdentitiesPage accounts={accounts} />
}
