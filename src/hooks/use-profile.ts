import { Did } from '@atproto/api'

import { useSWR } from '@/lib/swr'
import { ProfileData } from '@/types'

export const useProfile = (did: Did) => {
  const { data, error, isLoading } = useSWR([
    'api',
    `/api/profile?did=${encodeURIComponent(did)}`,
  ])

  return {
    error,
    isLoading,
    profile: data as unknown as ProfileData,
  }
}
