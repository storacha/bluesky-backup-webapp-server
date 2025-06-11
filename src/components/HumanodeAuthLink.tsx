'use client'
import { authorize } from '@storacha/capabilities/access'
import { useW3 } from '@storacha/ui-react'
import { base64url } from 'multiformats/bases/base64'
import { styled } from 'next-yak'
import { useEffect, useState } from 'react'

const HumanodeLink = styled.a`
  background-color: var(--color-dark-blue);
  color: var(--color-white);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-family: var(--font-dm-mono);
  font-size: 1.125rem;
`

export default function HumanodeAuthLink() {
  const [{ accounts, client }] = useW3()
  const account = accounts[0]
  const [state, setState] = useState<string>()

  useEffect(
    function () {
      ;(async () => {
        if (account && client) {
          // Create an access/authorize request that can be used as the state of the OAuth request.
          const request = await authorize.delegate({
            audience: client.agent.connection.id,
            issuer: client.agent.issuer,
            // agent that should be granted access
            with: client.agent.did(),
            // capabilities requested (account access)
            nb: {
              iss: account.did(),
              att: [
                {
                  can: '*',
                },
              ],
            },
            // expire this after 15 minutes
            expiration: Math.floor(Date.now() / 1000) + 60 * 15,
          })
          const archive = await request.archive()
          if (archive?.ok) {
            setState(base64url.encode(archive.ok))
          } else {
            console.warn('could not create auth delegation')
          }
        }
      })()
    },
    [client, account]
  )
  const humanodeHref = `${process.env.NEXT_PUBLIC_HUMANODE_AUTH_URL}?response_type=code&client_id=${process.env.NEXT_PUBLIC_HUMANODE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_HUMANODE_OAUTH_CALLBACK_URL}&scope=openid&state=${state}`
  return (
    <HumanodeLink href={humanodeHref} target="_blank" rel="noopener noreferrer">
      Give me a free plan!
    </HumanodeLink>
  )
}
