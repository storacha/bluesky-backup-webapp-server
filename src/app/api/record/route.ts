import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const uri = searchParams.get('uri')

  if (!uri) {
    return NextResponse.json(
      {
        error: 'Missing URI parameter',
        status: 400,
      },
      { status: 400 }
    )
  }

  try {
    // just incase we try to send list of uris [uri1, uri2,...]
    const cleanedUri = uri.replace(/[\[\]]/g, '').trim()
    const params = new URLSearchParams()
    params.append('uris', cleanedUri)

    const fullUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?${params.toString()}`
    const response = await fetch(fullUrl)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: `HTTP error ${response.status}` }
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch',
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        status: 500,
      },
      { status: 500 }
    )
  }
}
