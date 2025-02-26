'use client'

import { Authenticator, useW3 } from '@w3ui/react'
import { AuthenticationEnsurer } from '@/components/Authenticator'

function Identity () {
  const [{ client, accounts }] = useW3()
  return (
    <div className="m-12">
      <p className="mb-6">
        You&apos;re signed in as <b>{accounts[0].toEmail()}</b>.
      </p>
      <p>
        Your local agent&apos;s DID is
      </p>
      <p className="max-w-xl overflow-hidden text-ellipsis">
        {client?.agent.did()}
      </p>
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
