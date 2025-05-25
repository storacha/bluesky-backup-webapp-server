import { logger } from './logger'

let cachedConstants: {
  TOKEN_ENDPOINT_PRIVATE_KEY_JWK: string
  SERVER_IDENTITY_PRIVATE_KEY: string
  SESSION_PASSWORD: string
  SESSION_COOKIE_NAME: string
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

export const getConstants = () => {
  if (cachedConstants) {
    return cachedConstants
  }

  try {
    const requiredEnvVars = {
      TOKEN_ENDPOINT_PRIVATE_KEY_JWK: process.env.TOKEN_ENDPOINT_PRIVATE_KEY_JWK,
      SERVER_IDENTITY_PRIVATE_KEY: process.env.SERVER_IDENTITY_PRIVATE_KEY,
      SESSION_PASSWORD: process.env.SESSION_PASSWORD
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      throw new ConfigurationError(`Missing required environment variables: ${missingVars.join(', ')}`)
    }

    const DEFAULT_COOKIE_VALUE = 'bsky-backups'
    const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || DEFAULT_COOKIE_VALUE

    if (!process.env.SESSION_COOKIE_NAME) {
      logger.warn('Using default session cookie name', { defaultName: DEFAULT_COOKIE_VALUE })
    }

    cachedConstants = {
      TOKEN_ENDPOINT_PRIVATE_KEY_JWK: requiredEnvVars.TOKEN_ENDPOINT_PRIVATE_KEY_JWK!,
      SERVER_IDENTITY_PRIVATE_KEY: requiredEnvVars.SERVER_IDENTITY_PRIVATE_KEY!,
      SESSION_PASSWORD: requiredEnvVars.SESSION_PASSWORD!,
      SESSION_COOKIE_NAME
    }
    return cachedConstants
  } catch (error) {
    logger.error('Failed to initialize application constants', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw new ConfigurationError('Application configuration error')
  }
}
