
export const SERVER_IDENTITY_PRIVATE_KEY = process.env.SERVER_IDENTITY_PRIVATE_KEY as string;
if (!SERVER_IDENTITY_PRIVATE_KEY) throw new Error('SERVER_IDENTITY_PRIVATE_KEY must be set');export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'bsky-backups';
export const SESSION_PASSWORD = process.env.SESSION_PASSWORD as string;

