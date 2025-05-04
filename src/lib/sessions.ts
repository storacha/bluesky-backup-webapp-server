import { AtpSessionData } from '@atproto/api'
import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

import { getConstants } from '@/lib/server/constants'

export type AccountDID = string

export interface BBSession {
  did: AccountDID
  sessionData?: AtpSessionData
}

export async function getSession(): Promise<IronSession<BBSession>> {
  const { SESSION_PASSWORD, SESSION_COOKIE_NAME } = getConstants()
  const session = await getIronSession<BBSession>(await cookies(), {
    password: SESSION_PASSWORD,
    cookieName: SESSION_COOKIE_NAME,
  })
  return session
}

// temporarily here. we'll remove it again when travis takes a look.
export async function setSession(data: BBSession): Promise<void> {
  const { SESSION_PASSWORD, SESSION_COOKIE_NAME } = getConstants()
  const session = await getIronSession<BBSession>(await cookies(), {
    password: SESSION_PASSWORD,
    cookieName: SESSION_COOKIE_NAME,
  })

  Object.assign(session, data)
  await session.save()
}
