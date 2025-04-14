'use client'

import { useBskyAuthContext } from '@/contexts'
import { REQUIRED_ATPROTO_SCOPE } from '@/lib/constants'
import { useCallback, useState } from 'react'
import Button from './Button'
import Input from './Input'

export default function BlueskyAuthenticator() {
  const { initialized, authenticated, bskyAuthClient, userProfile, session } =
    useBskyAuthContext()
  const [handle, setHandle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async () => {
    if (!bskyAuthClient) return
    setIsLoading(true)
    setError(null)

    try {
      await bskyAuthClient.signIn(handle, {
        scope: REQUIRED_ATPROTO_SCOPE,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [handle, bskyAuthClient])

  if (!initialized) {
    return (
      <div className="flex justify-center p-4">
        <Button variant="ghost" isLoading>
          Initializing...
        </Button>
      </div>
    )
  }

  if (authenticated && userProfile) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-600">
            Authenticated to Bluesky as{' '}
            <span className="font-medium text-[var(--color-bluesky-blue)]">
              {userProfile.handle}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            on {session?.serverMetadata.issuer}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          signIn()
        }}
        className="flex flex-col gap-4"
      >
        <Input
          label="Bluesky Handle"
          placeholder="e.g., racha.bsky.social"
          value={handle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setHandle(e.target.value)
          }
          error={error || undefined}
          disabled={isLoading}
          variant="default"
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          isFullWidth
          disabled={!handle}
        >
          Sign in with Bluesky
        </Button>
      </form>
    </div>
  )
}
