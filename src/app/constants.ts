export type DID_WEB = `did:web:${string}`;
export type DID_KEY = `did:key:${string}`;

export const IDENTITY_AUTHORITY = process.env.NEXT_PUBLIC_IDENTITY_AUTHORITY_DID as DID_WEB;
if (!IDENTITY_AUTHORITY) throw new Error('NEXT_PUBLIC_IDENTITY_AUTHORITY must be set to the did:web of the service whose authentication decisions we trust - usually this should be did:web:up.storacha.network or did:web:staging.up.storacha.network');

export const SERVER_DID = process.env.NEXT_PUBLIC_SERVER_DID as DID_WEB;
if (!SERVER_DID) throw new Error('SERVER_DID must be set');

export const SERVER_IDENTITY_PRIVATE_KEY = process.env.SERVER_IDENTITY_PRIVATE_KEY as string;
if (!SERVER_IDENTITY_PRIVATE_KEY) throw new Error('SERVER_IDENTITY_PRIVATE_KEY must be set');

export const STAGING_UPLOAD_SERVICE_PUBLIC_KEY = 'did:key:z6MkhcbEpJpEvNVDd3n5RurquVdqs5dPU16JDU5VZTDtFgnn';
export const PRODUCTION_UPLOAD_SERVICE_PUBLIC_KEY = 'did:key:z6MkqdncRZ1wj8zxCTDUQ8CRT8NQWd63T7mZRvZUX8B7XDFi';

