import { useAuthenticator } from '@storacha/ui-react'

export function useStorachaAccount() {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  return account
}
