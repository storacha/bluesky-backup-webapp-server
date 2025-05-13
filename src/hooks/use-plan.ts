import { Account, useAuthenticator } from '@storacha/ui-react'

import { useSWR } from '@/lib/swr'

export function useStorachaAccount() {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  return account
}

export const usePlan = (account?: Account) =>
  useSWR(account && ['storacha-plan', account])
