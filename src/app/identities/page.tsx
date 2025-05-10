import { findAuthedBskyAccounts } from '@/lib/atproto'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

import IdentitiesPage from './IdentitiesPage'

export default async function Identities() {
  const { did: account } = await getSession()
  const { authSessionStore } = getStorageContext()
  const accounts = await findAuthedBskyAccounts(authSessionStore, account)

  return <IdentitiesPage accounts={accounts} />
}
