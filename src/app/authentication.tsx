'use client'

import { useAuthenticator } from '@storacha/ui-react'
import type { ReactNode } from 'react'

// Re-export as a Client Component, so it can safely be used in a Server
// Component.
export { Authenticator } from '@storacha/ui-react'

/**
 * Renders {@link children} if the user is authenticated, otherwise renders
 * {@link unauthenticated}.
 */
export function Authenticated({
  children,
  unauthenticated,
}: {
  children: ReactNode
  unauthenticated: ReactNode
}): ReactNode {
  const [{ accounts }] = useAuthenticator()
  const authenticated = accounts.length > 0
  if (authenticated) {
    return children
  }

  return unauthenticated

  // TK: Need to stop this, because it causes flicker when the user is logged in.

  // NB: There's a moment when the client is not actually present yet. We still
  // render the login screen to avoid flicker, betting that the client will be
  // present by the time the user is able to actually try to log in.
}

export function LogOutButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): ReactNode {
  const [, { logout }] = useAuthenticator()
  return (
    <button className={className} onClick={logout}>
      {children}
    </button>
  )
}
