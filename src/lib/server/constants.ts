let cachedConstants: {
  TOKEN_ENDPOINT_PRIVATE_KEY_JWK: string
  SERVER_IDENTITY_PRIVATE_KEY: string
  SESSION_PASSWORD: string
  SESSION_COOKIE_NAME: string
}

export const getConstants = () => {
  if (cachedConstants) {
    return cachedConstants
  }
  if (!process.env.TOKEN_ENDPOINT_PRIVATE_KEY_JWK)
    throw new Error('TOKEN_ENDPOINT_PRIVATE_KEY_JWK must be set')
  const TOKEN_ENDPOINT_PRIVATE_KEY_JWK =
    process.env.TOKEN_ENDPOINT_PRIVATE_KEY_JWK
  if (!process.env.SERVER_IDENTITY_PRIVATE_KEY)
    throw new Error('SERVER_IDENTITY_PRIVATE_KEY must be set')
  const SERVER_IDENTITY_PRIVATE_KEY = process.env.SERVER_IDENTITY_PRIVATE_KEY

  if (!process.env.SESSION_PASSWORD)
    throw new Error('SESSION_PASSWORD must be set')
  const SESSION_PASSWORD = process.env.SESSION_PASSWORD

  const DEFAULT_COOKIE_VALUE = 'bsky-backups'
  const SESSION_COOKIE_NAME =
    process.env.SESSION_COOKIE_NAME || DEFAULT_COOKIE_VALUE
  if (!process.env.SESSION_COOKIE_NAME) {
    console.warn(
      `SESSION_COOKIE_NAME is not set - using default value of ${DEFAULT_COOKIE_VALUE}`
    )
  }
  cachedConstants = {
    TOKEN_ENDPOINT_PRIVATE_KEY_JWK,
    SERVER_IDENTITY_PRIVATE_KEY,
    SESSION_PASSWORD,
    SESSION_COOKIE_NAME,
  }
  return cachedConstants
}
