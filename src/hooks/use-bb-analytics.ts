import { useSearchParams } from 'next/navigation'
import { usePlausible } from 'next-plausible'
import { useCallback, useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'

import { BBEvents } from '@/types'

const utms = [
  'utm_source',
  'utm_medium',
  'utm_content',
  'utm_term',
  'utm_content',
]

export const useBBAnalytics = () => {
  const plausible = usePlausible<BBEvents>()
  const searchParams = useSearchParams()

  /**
   * useLocalStorage and useEffect here combine to give us something
   * similar to useMemo except:
   * a) the value is kept in local storage
   * b) we only update the value when searchParams has utm_* parameters
   */
  const [utmParams, setUtmParams] = useLocalStorageState<
    Record<string, string>
  >('utms', { defaultValue: {} })
  useEffect(() => {
    const utmps = utms.reduce(
      (m, utm) => {
        const value = searchParams.get(utm)
        if (value) {
          m[utm] = value
        }
        return m
      },
      {} as Record<string, string>
    )
    if (Object.keys(utmps).length > 0) {
      setUtmParams(utmps)
    }
  }, [searchParams, setUtmParams])

  const logPlanSelection = useCallback(
    (props: BBEvents['plan-selection']) => {
      plausible('plan-selection', {
        props: { ...utmParams, ...props },
      })
    },
    [plausible, utmParams]
  )

  const logBackupCreationStarted = useCallback(
    (props: BBEvents['create-backup-started']) => {
      plausible('create-backup-started', { props })
    },
    [plausible]
  )

  const logBackupCreationSuccessful = useCallback(
    (props: BBEvents['create-backup-success']) => {
      plausible('create-backup-success', { props })
    },
    [plausible]
  )

  const logBlueskyLoginStarted = useCallback(
    (props: BBEvents['connect-bluesky-started']) => {
      plausible('connect-bluesky-started', { props })
    },
    [plausible]
  )

  const logBlueskyLoginSuccessful = useCallback(
    (props: BBEvents['connect-bluesky-success']) => {
      plausible('connect-bluesky-success', { props })
    },
    [plausible]
  )

  const logLoginStarted = useCallback(
    (props: BBEvents['login-started']) => {
      plausible('login-started', {
        props: { ...utmParams, ...props },
      })
    },
    [plausible, utmParams]
  )

  const logLoginSuccessful = useCallback(
    (props: BBEvents['login-success']) => {
      plausible('login-success', {
        props: { ...utmParams, ...props },
      })
    },
    [plausible, utmParams]
  )

  return {
    logPlanSelection,
    logBackupCreationStarted,
    logBackupCreationSuccessful,
    logBlueskyLoginStarted,
    logBlueskyLoginSuccessful,
    logLoginStarted,
    logLoginSuccessful,
  }
}
