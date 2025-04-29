import {
  Account,
  DID,
  PlanGetSuccess,
  PlanSetSuccess,
  PlanSetFailure,
  Result,
} from '@w3ui/react'
import useSWR, { SWRResponse } from 'swr'
import { useAuthenticator } from '@storacha/ui-react'
import { logAndCaptureError } from '@/app/sentry'

/**
 * calculate the cache key for a plan's account
 */
const planKey = (account: Account) =>
  account ? `/plan/${account.did()}` : undefined

type UsePlanResult = SWRResponse<PlanGetSuccess | undefined> & {
  setPlan: (plan: DID) => Promise<Result<PlanSetSuccess, PlanSetFailure>>
}

const usePlan = (account: Account | undefined) => {
  const result = useSWR<PlanGetSuccess | undefined>(
    account && planKey(account),
    {
      fetcher: async () => {
        if (!account) return
        const result = await account.plan.get()
        if (result.error)
          throw new Error('getting plan', { cause: result.error })
        return result.ok
      },
      onError: logAndCaptureError,
    }
  )

  if (account) {
    // @ts-expect-error it's important to assign this into the existing object
    // to avoid calling the getters in SWRResponse when copying values over -
    // I can't think of a cleaner way to do this but open to refactoring
    result.setPlan = async (plan: DID) => {
      const setResult = await account.plan.set(plan)
      await result.mutate()
      return setResult
    }
  }

  return result as UsePlanResult
}
export function useStorachaAccount() {
  const [{ accounts }] = useAuthenticator()
  const account = accounts[0]
  return account
}
