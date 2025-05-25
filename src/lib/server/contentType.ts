import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data'
]

export function validateContentType(request: NextRequest) {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return new NextResponse('Content-Type header is required', { status: 415 })
  }

  // Check if the content type is in the allowed list
  const isAllowed = ALLOWED_CONTENT_TYPES.some(allowedType => 
    contentType.startsWith(allowedType)
  )

  if (!isAllowed) {
    return new NextResponse(
      `Content-Type ${contentType} is not supported. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
      { status: 415 }
    )
  }

  return null
}

export function validateJsonContent(request: NextRequest) {
  const contentType = request.headers.get('content-type')
  
  if (!contentType || !contentType.startsWith('application/json')) {
    return new NextResponse('Content-Type must be application/json', { status: 415 })
  }

  return null
}

export function validateFormContent(request: NextRequest) {
  const contentType = request.headers.get('content-type')
  
  if (!contentType || 
      (!contentType.startsWith('application/x-www-form-urlencoded') && 
       !contentType.startsWith('multipart/form-data'))) {
    return new NextResponse(
      'Content-Type must be application/x-www-form-urlencoded or multipart/form-data',
      { status: 415 }
    )
  }

  return null
} 