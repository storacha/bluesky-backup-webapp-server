import { getSession } from '@/lib/sessions'

export async function GET() {
  const session = await getSession()
  if (session.did) {
    return new Response(session.did, { status: 200 })
  } else {
    return new Response('no session', { status: 401 })
  }
}
