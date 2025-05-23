'use client'

import {
  AppName,
  Authenticator as StorachaAuthenticator,
  AuthenticatorRootProps,
  useAuthenticator,
} from '@storacha/ui-react'
import { Fragment } from 'react'

import type { ReactNode } from 'react'

export const Authenticator = (props: AuthenticatorRootProps) => (
  <StorachaAuthenticator
    as={Fragment}
    appName={AppName.BskyBackups}
    {...props}
  />
)

/**
 * Renders {@link children} if the user is authenticated, otherwise renders
 * {@link unauthenticated}.
 */
export function Authenticated({
  loading,
  unauthenticated,
  children,
}: {
  loading: ReactNode
  unauthenticated: ReactNode
  children: ReactNode
}): ReactNode {
  const [{ client, accounts }] = useAuthenticator()
  const authenticated = accounts.length > 0

  if (!client) {
    return loading
  } else if (authenticated) {
    return children
  } else {
    return unauthenticated
  }
}

export function LogOutButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): ReactNode {
  const [, { logout }] = useAuthenticator()
  async function logoutAndDestroySession() {
    await fetch('/session/destroy', { method: 'POST' })
    await logout()
  }
  return (
    <button className={className} onClick={logoutAndDestroySession}>
      {children}
    </button>
  )
}
