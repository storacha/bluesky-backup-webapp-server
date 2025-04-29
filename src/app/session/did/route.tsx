import { getSession } from '@/lib/sessions'

export async function GET() {
  const session = await getSession()
  if (session.did) {
    return Response.json(session.did, { status: 200 })
  } else {
    return Response.json('no session', { status: 401 })
  }
}
