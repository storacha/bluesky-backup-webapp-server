import { Did } from '@atproto/api'

import { useSWR } from '@/lib/swr'

export const useProfile = (did: Did | undefined) => {
  const { data, error, isLoading } = useSWR(
    did && ['api', `/api/profile?did=${encodeURIComponent(did)}`]
  )

  return {
    error,
    isLoading,
    profile: data,
  }
}
