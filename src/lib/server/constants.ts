if (!process.env.SERVER_IDENTITY_PRIVATE_KEY)
  throw new Error('SERVER_IDENTITY_PRIVATE_KEY must be set')
export const SERVER_IDENTITY_PRIVATE_KEY =
  process.env.SERVER_IDENTITY_PRIVATE_KEY

if (!process.env.SESSION_PASSWORD)
  throw new Error('SESSION_PASSWORD must be set')
export const SESSION_PASSWORD = process.env.SESSION_PASSWORD

const DEFAULT_COOKIE_VALUE = 'bsky-backups'
export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || DEFAULT_COOKIE_VALUE
if (!process.env.SESSION_COOKIE_NAME) {
  console.warn(
    `SESSION_COOKIE_NAME is not set - using default value of ${DEFAULT_COOKIE_VALUE}`
  )
}
