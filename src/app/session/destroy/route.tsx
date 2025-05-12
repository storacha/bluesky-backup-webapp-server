import { getSession } from '@/lib/sessions'

export async function POST() {
  const session = await getSession()
  session.destroy()
  return Response.json({}, { status: 200 })
}
