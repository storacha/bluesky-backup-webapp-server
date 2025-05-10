import { Did } from '@atproto/api'
import { NextRequest, NextResponse } from 'next/server'

import { PlcProfile, ProfileData } from '@/types'

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

async function fetchPlcProfile(did: Did): Promise<PlcProfile> {
  const response = await fetch(
    `https://plc.directory/${encodeURIComponent(did)}/data`
  )
  if (!response.ok)
    throw new Error(`Failed to fetch profile: ${response.status}`)

  const { rotationKeys, alsoKnownAs, verificationMethods, services } =
    await response.json()
  return {
    did,
    rotationKeys,
    alsoKnownAs,
    verificationMethods,
    services,
  }
}

interface BskyProfile {
  did: Did
  handle: string
  displayName: string
}

async function fetchBskyProfile(did: Did): Promise<BskyProfile> {
  const response = await fetch(
    `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`
  )
  if (!response.ok)
    throw new Error(`Failed to fetch profile: ${response.status}`)

  return await response.json()
}

async function getPublicProfile(did: Did): Promise<ProfileData | null> {
  if (did.startsWith('did:plc')) {
    const [
      { rotationKeys, alsoKnownAs, verificationMethods, services },
      { handle, displayName },
    ] = await Promise.all([fetchPlcProfile(did), fetchBskyProfile(did)])
    return {
      did,
      handle,
      displayName,
      rotationKeys,
      alsoKnownAs,
      verificationMethods,
      services,
    }
  } else {
    throw new Error('Cannot get profile information for a did:web')
  }
}
