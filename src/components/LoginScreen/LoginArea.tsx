'use client'

import { styled } from 'next-yak'
import { Authenticator, useAuthenticator } from '@storacha/ui-react'
import { LoginForm } from './LoginForm'
import { LoggingIn } from './LoggingIn'

const Outside = styled.div`
  border: 1px solid var(--color-gray-light);
  border-radius: 0.75rem;
  padding: 2.5rem;
  box-shadow: 0px 8px 26px 0px #63637514;
`

export const LoginArea = () => {
  const [{ submitted, email }, { setEmail, cancelLogin }] = useAuthenticator()

  return (
    <Outside>
      <Authenticator.Form>
        {submitted ? (
          <LoggingIn {...{ email, cancelLogin }} />
        ) : (
          <LoginForm {...{ email, setEmail }} />
        )}
      </Authenticator.Form>
    </Outside>
  )
}
