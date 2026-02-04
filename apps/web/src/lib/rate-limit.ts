const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 10,
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now - record.lastReset > config.windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    }
  }

  if (record.count >= config.maxRequests) {
    const resetIn = config.windowMs - (now - record.lastReset)
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: config.windowMs - (now - record.lastReset),
  }
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.lastReset > 5 * 60 * 1000) {
      rateLimitMap.delete(key)
    }
  }
}, 60 * 1000)
