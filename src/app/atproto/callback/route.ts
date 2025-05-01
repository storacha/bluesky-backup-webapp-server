import { Agent } from '@atproto/api'
import { isDid } from '@atproto/oauth-client-node'
import { NextRequest } from 'next/server'

import { createClient } from '@/lib/atproto'
import { getSession } from '@/lib/sessions'

export async function GET(request: NextRequest) {
  const { did: account } = await getSession()
  if (!account) {
    return new Response(`Not authorized`, {
      status: 401,
    })
  }
  if (!isDid(account)) {
    return new Response(`Account must be a DID, but got: ${account}`, {
      status: 400,
    })
  }
  const client = createClient({ account })

  const { session } = await client.callback(request.nextUrl.searchParams)
  const agent = new Agent(session)

  if (!agent.did) {
    return new Response('No DID found in session', { status: 400 })
  }

  return new Response(
    `<html>
      <body>
        <script>
          window.close();
        </script>
      </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html' },
    }
  )
}
