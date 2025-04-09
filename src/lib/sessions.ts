import { getIronSession, IronSession } from "iron-session"
import { SESSION_COOKIE_NAME, SESSION_PASSWORD } from "@/lib/server/constants";
import { cookies } from 'next/headers';

export type AccountDID = string

export interface BBSession {
  did: AccountDID
}

export async function getSession(): Promise<IronSession<BBSession>>{

  const session = await getIronSession<BBSession>(await cookies(), {
    password: SESSION_PASSWORD,
    cookieName: SESSION_COOKIE_NAME
  })
  return session
}