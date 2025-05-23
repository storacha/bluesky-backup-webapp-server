import { findAllIdentities } from '@/lib/atproto'
import { getSession } from '@/lib/sessions'

import IdentitiesPage from './IdentitiesPage'

// we need this here because of the call to findAuthedBskyAccounts which uses secrets only available at runtime
export const dynamic = 'force-dynamic'

export default async function Identities() {
  await getSession() // Keep session check but don't use the result
  const identities = await findAllIdentities()

  return <IdentitiesPage identities={identities} />
}
