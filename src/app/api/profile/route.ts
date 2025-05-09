import { Agent as AtprotoAgent, Did } from '@atproto/api'
import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/atproto'
import { ProfileData } from '@/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const did = searchParams.get('did')

  if (!did)
    return NextResponse.json(
      { error: 'DID parameter is required' },
      { status: 400 }
    )

  try {
    const profile = await getPublicProfile(did as Did)
    if (!profile)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

async function getPublicProfile(did: Did): Promise<ProfileData | null> {
  try {
    if (did.startsWith('did:plc')) {
      const response = await fetch(`https://plc.directory/${did}`)
      if (!response.ok)
        throw new Error(`Failed to fetch profile: ${response.status}`)

      const data = await response.json()
      const handle = data.alsoKnownAs?.find(
        (aka: string) => aka.startsWith('at://') && aka.includes('.')
      )
      const profileHandle = handle ? handle.replace('at://', '') : null
      if (!handle) return { did, handle: 'unknown' }

      try {
        const client = await createClient({ account: did })
        const atpSession = await client.restore(did)
        const atpAgent = new AtprotoAgent(atpSession)

        if (!did) throw new Error('No bacKUP DID supplied')

        const profile = await atpAgent.app.bsky.actor.getProfile({ actor: did })
        return {
          did: profile.data.did,
          handle: profile.data.handle,
          displayName: profile.data.displayName,
        }
      } catch (error) {
        console.error(error)
      }

      return { did, handle: profileHandle }
    } else if (did.startsWith('did:web')) {
      const domain = did.replace('did:web', '').replace(/%3A/g, ':')
      return {
        did,
        handle: domain.replace('at://', ''),
        displayName: domain.replace('at://', ''),
      }
    } else {
      return { did, handle: 'unknown' }
    }
  } catch (error) {
    console.error(`Error getting public profile for ${did}:`, error)
    return null
  }
}
