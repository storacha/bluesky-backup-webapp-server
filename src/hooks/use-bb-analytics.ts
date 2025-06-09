import { useSearchParams } from 'next/navigation'
import { usePlausible } from 'next-plausible'
import { useCallback, useEffect, useState } from 'react'

import { BBEvents } from '@/types'

type StoredUtm = {
  ttl: number
  timestamp: number
  params: Record<string, string>
}

export const useBBAnalytics = () => {
  const plausible = usePlausible<BBEvents>()
  const [utmParams, setUtmParams] = useState<Record<string, string>>({})

  const searchParams = useSearchParams()

  useEffect(() => {
    // initially the approach here was to retain the UTM params in session
    // pretty much just a browser tab session, so when that tab closes, the data is lost
    // i moved towards a 'keep this data for a while and clear it' approach with localStorage instead of sessionStorage
    const DURATION = 7 * 24 * 60 * 60 + 1000

    const getUtmParams = () => {
      const params: Record<string, string> = {}
      ;[
        'utm_source',
        'utm_medium',
        'utm_content',
        'utm_term',
        'utm_content',
      ].forEach((param) => {
        const value = searchParams.get(param)
        if (value) {
          params[param] = value
        }
      })

      setUtmParams(params)

      if (Object.keys(params).length > 0) {
        const utmData = {
          params,
          ttl: DURATION,
          timeStamp: Date.now(),
        }
        localStorage.setItem('bb_utm_params', JSON.stringify(utmData))
      }
    }

    const storedUtmData = localStorage.getItem('bb_utm_params')
    if (storedUtmData) {
      try {
        const parsed: StoredUtm = JSON.parse(storedUtmData)
        if (parsed.timestamp && Date.now() - parsed.timestamp < parsed.ttl) {
          setUtmParams(parsed.params)
        } else {
          localStorage.removeItem('bb_utm_params')
          getUtmParams()
        }
      } catch (error) {
        localStorage.removeItem('bb_utm_params')
        getUtmParams()
        console.error(error)
      }
    } else {
      getUtmParams()
    }
  }, [searchParams])

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
      plausible('Login Started', { props })
    },
    [plausible]
  )

  const logLoginSuccessful = useCallback(
    (props: BBEvents['Login Successful']) => {
      plausible('Login Successful', { props })
    },
    [plausible]
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
