'use client'

import React, { ReactNode } from 'react'
import { Authenticator, useW3, useAuthenticator } from '@w3ui/react'
import { Loader } from './Loader'
import Button from './Button'
import Input from './Input'


export function AuthenticationForm (): ReactNode {
  const [{ submitted }] = useAuthenticator()
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm w-full max-w-md">
      <Authenticator.Form className="flex flex-col gap-4">
        <Authenticator.EmailInput
          as={Input}
          label="Email Address"
          placeholder="Enter your email"
          required
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={submitted}
          disabled={submitted}
          isFullWidth
        >
          Authorize
        </Button>
      </Authenticator.Form>
    </div>
  )
}

export function AuthenticationSubmitted (): ReactNode {
  const [{ email }] = useAuthenticator()
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm w-full max-w-md">
      <p className="text-sm text-gray-600 mb-4">
        Click the link in the email we sent to{" "}
        <span className="font-semibold text-[var(--color-storacha-blue)]">
          {email}
        </span>{" "}
        to authorize this agent.
      </p>
      <Authenticator.CancelButton
        as={Button}
        variant="outline"
        isFullWidth
      >
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

function Identity() {
  const [{ client, accounts }] = useW3()

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-600">
          Signed in as{" "}
          <span className="font-medium text-[var(--color-storacha-blue)]">
            {accounts[0].toEmail()}
          </span>
        </div>
        {client?.agent.did() && (
          <div className="text-xs text-gray-500 truncate max-w-md">
            {client.agent.did()}
          </div>
        )}
      </div>
    </div>
  )
}

export default function StorachaAuthenticator () {

  return (
    <Authenticator>
      <AuthenticationEnsurer>
        <Identity />
      </AuthenticationEnsurer>
    </Authenticator>
  )
}
