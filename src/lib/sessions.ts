import { getIronSession, IronSession } from 'iron-session'
import { getConstants } from '@/lib/server/constants'
import { cookies } from 'next/headers'

export type AccountDID = string

export interface BBSession {
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

export async function setSession(data: BBSession): Promise<void> {
  const { SESSION_PASSWORD, SESSION_COOKIE_NAME } = getConstants()
  const session = await getIronSession<BBSession>(await cookies(), {
    password: SESSION_PASSWORD,
    cookieName: SESSION_COOKIE_NAME,
  })

  Object.assign(session, data)
  await session.save()
}
