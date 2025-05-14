import { Did } from '@atproto/api'

import { useKeychainContext } from '@/contexts/keychain'
import { useProfile } from '@/hooks/use-profile'

import KeychainView from './KeychainView'

export default function Keychain({ atprotoAccount }: { atprotoAccount: Did }) {
  const props = useKeychainContext()
  const { data: profile } = useProfile(atprotoAccount)
  const { handle, rotationKeys } = profile ?? {}

  return (
    <KeychainView
      {...props}
      {...profile}
      handle={handle}
      rotationKeys={rotationKeys}
      atprotoAccount={atprotoAccount}
    />
  )
}
