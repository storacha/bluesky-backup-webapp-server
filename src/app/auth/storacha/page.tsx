'use client'
import { Authenticator, useW3 } from '@w3ui/react'
import { AuthenticationEnsurer } from '@/components/Authenticator'
import Provider from '@/components/W3UIProvider'

function Identity () {
  const [{ client, accounts }] = useW3()
  return (
    <div className="m-12">
      <p className="mb-6">
        You're signed in as <b>{accounts[0].toEmail()}</b>.
      </p>
      <p>
        Your local agent's DID is
      </p>
      <p className="max-w-xl overflow-hidden text-ellipsis">
        {client?.agent.did()}
      </p>
    </div>
  )
}

function page () {
  return (
    <div className='bg-grad flex flex-col items-center h-screen'>
      <Provider>
        <Authenticator>
          <AuthenticationEnsurer>
            <Identity />
          </AuthenticationEnsurer>
        </Authenticator>
      </Provider>
    </div>
  )
}

export default page