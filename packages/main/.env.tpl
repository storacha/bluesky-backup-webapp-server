# set these to your upload API service URL and the DID your service is using as its service DID
NEXT_PUBLIC_STORACHA_SERVICE_URL=https://staging.up.storacha.network
NEXT_PUBLIC_STORACHA_RECEIPTS_URL=https://staging.up.storacha.network/receipt/
NEXT_PUBLIC_STORACHA_SERVICE_DID=did:web:staging.up.storacha.network
NEXT_PUBLIC_STORACHA_PROVIDER=did:web:staging.up.storacha.network
NEXT_PUBLIC_IDENTITY_AUTHORITY=did:web:staging.up.storacha.network

# set to the multiformatted private key of this service, eg MgCZT5vOnYZoVAeyjnzuJIVY9J4LNtJ+f8Js0cTPuKUpFne0BVEDJjEu6quFIU8yp91/TY/+MYK8GvlKoTDnqOCovCVM=
SERVER_IDENTITY_PRIVATE_KEY=
NEXT_PUBLIC_SERVER_DID='did:web:bskybackups.storacha.network'

# set these to your gateway service URL and DID 
NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME=ipfs-staging.w3s.link
NEXT_PUBLIC_STORACHA_GATEWAY_ID=did:web:ipfs-staging.w3s.link

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://bf79c216fe3c72328219f04aabeebc99@o609598.ingest.us.sentry.io/4508456692940801
NEXT_PUBLIC_SENTRY_ORG=storacha-it
NEXT_PUBLIC_SENTRY_PROJECT=bluesky-backup
NEXT_PUBLIC_SENTRY_ENV=development

# Deployment URL, for Bluesky
NEXT_PUBLIC_BLUESKY_CLIENT_URI=http://localhost

# Stripe
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_1R1egaF6A5ufQX5vyumO9QAf
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51LO87hF6A5ufQX5viNsPTbuErzfavdrEFoBuaJJPfoIhzQXdOUdefwL70YewaXA32ZrSRbK4U4fqebC7SVtyeNcz00qmgNgueC

# App sessions
SESSION_COOKIE_NAME=bsky-backups-dev
SESSION_PASSWORD=changethistosomethingsecretandatleast32characterslong