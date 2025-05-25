import { Redis } from 'ioredis'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

interface RateLimitConfig {
  windowMs: number
  max: number
  keyPrefix: string
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyPrefix: 'rate-limit:'
}

export async function rateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
) {
  const { windowMs, max, keyPrefix } = { ...defaultConfig, ...config }
  const ip = request.ip || 'unknown'
  const key = `${keyPrefix}${ip}`

  try {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.pexpire(key, windowMs)
    }

    if (current > max) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(windowMs / 1000).toString(),
          'X-RateLimit-Limit': max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + windowMs).toString()
        }
      })
    }

    return null
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow the request if Redis is down
    return null
  }
}

export const authRateLimit = (request: NextRequest) => {
  return rateLimit(request, {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    keyPrefix: 'auth-rate-limit:'
  })
} 