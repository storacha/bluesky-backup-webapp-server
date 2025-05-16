import { AppBskyActorGetProfile, Did } from '@atproto/api'
import { DocumentData } from '@did-plc/lib'
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

async function fetchPlcProfile(did: Did) {
  const response = await fetch(
    `https://plc.directory/${encodeURIComponent(did)}/data`
  )
  if (!response.ok)
    throw new Error(`Failed to fetch profile: ${response.status}`)

  const { rotationKeys, alsoKnownAs, verificationMethods, services } =
    (await response.json()) as DocumentData
  return {
    did,
    rotationKeys,
    alsoKnownAs,
    verificationMethods,
    services,
  }
}

async function fetchBskyProfile(did: Did) {
  const response = await fetch(
    `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`
  )
  if (!response.ok)
    throw new Error(`Failed to fetch profile: ${response.status}`)

  return (await response.json()) as AppBskyActorGetProfile.OutputSchema
}

async function getPublicProfile(did: Did): Promise<ProfileData | null> {
  if (!did.startsWith('did:plc'))
    throw new Error(
      `Cannot get profile information for ${did} - only did:plc supported`
    )

  const [
    { rotationKeys, alsoKnownAs, verificationMethods, services },
    { handle, displayName, avatar },
  ] = await Promise.all([fetchPlcProfile(did), fetchBskyProfile(did)])
  return {
    did,
    handle,
    displayName,
    avatar,
    rotationKeys,
    alsoKnownAs,
    verificationMethods,
    services,
  }
}
