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
  const [utmParams, setUtmParams] = useLocalStorageState<
    Record<string, string>
  >('utms', { defaultValue: {} })
  const searchParams = useSearchParams()

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

  // for events like first time signups/plan selection, we need the utm
  // params alongside whatever data we choose to send
  const withUTMParams = useCallback(
    (props = {}) => {
      return {
        ...utmParams,
        ...props,
      }
    },
    [utmParams]
  )

  const logPlanSelection = useCallback(
    (props: BBEvents['Plan Selection']) => {
      plausible('Plan Selection', {
        props: withUTMParams(props),
      })
    },
    [plausible, withUTMParams]
  )

  const logBackupCreationStarted = useCallback(
    (props: BBEvents['Backup Creation Started']) => {
      plausible('Backup Creation Started', { props })
    },
    [plausible]
  )

  const logBackupCreationSuccessful = useCallback(
    (props: BBEvents['Backup Creation Successful']) => {
      plausible('Backup Creation Successful', { props })
    },
    [plausible]
  )

  const logBlueskyLoginSuccessful = useCallback(
    (props: BBEvents['Bluesky Connect Successful']) => {
      plausible('Bluesky Connect Successful', { props })
    },
    [plausible]
  )

  const logBlueskyLoginStarted = useCallback(
    (props: BBEvents['Bluesky Connect Started']) => {
      plausible('Bluesky Connect Started', { props })
    },
    [plausible]
  )

  const logLoginStarted = useCallback(
    (props: BBEvents['Login Started']) => {
      plausible('Login Started', {
        props: withUTMParams(props),
      })
    },
    [plausible, withUTMParams]
  )

  const logLoginSuccessful = useCallback(
    (props: BBEvents['Login Successful']) => {
      plausible('Login Successful', {
        props: withUTMParams(props),
      })
    },
    [plausible, withUTMParams]
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
