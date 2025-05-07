import { Did } from '@atproto/api'
import { NextRequest, NextResponse } from 'next/server'

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
        const profileResponse = await fetch(
          `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${did}`
        )

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          return {
            did,
            handle: profileData.handle,
            displayName: profileData.displayName || profileData.handle,
          }
        }

        if (!profileResponse.ok) {
          const errText = await profileResponse.text()
          console.error(
            `Failed to fetch detailed profile: ${profileResponse.status}`,
            errText
          )
        }
      } catch (error) {
        console.error('Error fetching detailed profile:', error)
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
