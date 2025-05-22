import { Did } from '@atproto/api'

import { useSWR } from '@/lib/swr'

export const useProfile = (did: Did) => useSWR(['atproto-profile', did])
