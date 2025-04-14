import { capability, DID } from '@ucanto/validator'

/**
 * The ability change atproto logins on this service for a given Account.
 */
export const atproto = capability({
  can: 'bskybackups.storacha.network/atproto',
  /**
   * The Account
   */
  with: DID,
})
