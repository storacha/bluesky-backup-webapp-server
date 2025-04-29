import { getIronSession, IronSession } from 'iron-session'
import { getConstants } from '@/lib/server/constants'
import { cookies } from 'next/headers'

type AccountDID = string

interface BBSession {
  did: AccountDID
}

export async function getSession(): Promise<IronSession<BBSession>> {
  const { SESSION_PASSWORD, SESSION_COOKIE_NAME } = getConstants()
  const session = await getIronSession<BBSession>(await cookies(), {
    password: SESSION_PASSWORD,
    cookieName: SESSION_COOKIE_NAME,
  })
  return session
}
