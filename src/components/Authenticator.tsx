import React, { ReactNode } from 'react'
import { Authenticator, useAuthenticator } from '@w3ui/react'
import { Loader } from './Loader'

export function AuthenticationForm (): ReactNode {
  const [{ submitted }] = useAuthenticator()
  return (
    <div className='authenticator'>
      <Authenticator.Form className='flex flex-row'>
        <Authenticator.EmailInput className='ipt w-82' placeholder="Email" required />
        <button
          className='btn'
          type='submit'
          disabled={submitted}>
          Authorize
        </button>
      </Authenticator.Form>
    </div >
  )
}

export function AuthenticationSubmitted (): ReactNode {
  const [{ email }] = useAuthenticator()
  return (
    <div>
        <p className='py-1'>
          Click the link in the email we sent to <span className='font-semibold tracking-wide'>{email}</span> to authorize this agent.
        </p>
        <Authenticator.CancelButton className='btn pb-2' >
          Cancel
        </Authenticator.CancelButton>
    </div>
  )
}

export function AuthenticationEnsurer ({ children }: { children: ReactNode }): ReactNode {
  const [{ submitted, accounts, client }] = useAuthenticator()
  const authenticated = accounts.length > 0
  if (authenticated) {
    return <>{children}</>
  }
  if (submitted) {
    return <AuthenticationSubmitted />
  }
  if (client != null) {
    return <AuthenticationForm />
  }
  return <Loader />
}