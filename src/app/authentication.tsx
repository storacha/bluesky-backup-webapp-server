'use client'

import { Authenticator, useAuthenticator } from '@storacha/ui-react'
import type { ReactNode } from 'react'

/**
 * Renders {@link children} if the user is authenticated, otherwise renders
 * {@link unauthenticated}.
 */
export function Authenticated(props: {
  children: ReactNode
  unauthenticated: ReactNode
}): ReactNode {
  return (
    <Authenticator as="div">
      <InnerAuthenticated {...props} />
    </Authenticator>
  )
}

// Separate component to be able to use `useAuthenticator` hook.
function InnerAuthenticated({
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

  // NB: There's a moment when the client is not actually present yet. We still
  // render the login screen to avoid flicker, betting that the client will be
  // present by the time the user is able to actually try to log in.
}

export function LogOutButton({ children }: { children: ReactNode }): ReactNode {
  const [, { logout }] = useAuthenticator()
  return <button onClick={logout}>{children}</button>
}
