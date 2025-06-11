<%
# Don't mess with this file -- it will auto compile to env.production.local
if [ "$TF_WORKSPACE" != "prod" ]; then
  UPLOAD_PREFIX="staging."
  GATEWAY_PREFIX="-staging"
  STORACHA_DID="staging.up.storacha.network"
  PRICING_TABLE_ID="prctbl_1R1egaF6A5ufQX5vyumO9QAf"
  PUBLISHABLE_KEY="pk_test_51LO87hF6A5ufQX5viNsPTbuErzfavdrEFoBuaJJPfoIhzQXdOUdefwL70YewaXA32ZrSRbK4U4fqebC7SVtyeNcz00qmgNgueC"
else
  UPLOAD_PREFIX=""
  GATEWAY_PREFIX=""
  STORACHA_DID="web3.storage"
  PRICING_TABLE_ID="prctbl_1R58oLF6A5ufQX5vozallJKX"
  PUBLISHABLE_KEY="pk_live_51LO87hF6A5ufQX5vQTO5BHyz8y9ybJp4kg1GsBjYuqwluuwtQTkbeZzkoQweFQDlv7JaGjuIdUWAyuwXp3tmCfsM005lJK9aS8"
fi
%>

# set these to your upload API service URL and the DID your service is using as its service DID
NEXT_PUBLIC_STORACHA_SERVICE_URL=https://<%= $UPLOAD_PREFIX %>up.storacha.network
NEXT_PUBLIC_STORACHA_RECEIPTS_URL=https://<%= $UPLOAD_PREFIX %>up.storacha.network/receipt/
NEXT_PUBLIC_STORACHA_SERVICE_DID=did:web:<%= $STORACHA_DID %>
NEXT_PUBLIC_STORACHA_PROVIDER=did:web:<%= $STORACHA_DID %>
NEXT_PUBLIC_IDENTITY_AUTHORITY=did:web:<%= $STORACHA_DID %>

# set these to your gateway service URL and DID 
NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME=ipfs<%= $GATEWAY_PREFIX %>.w3s.link
NEXT_PUBLIC_STORACHA_GATEWAY_ID=did:web:ipfs<%= $GATEWAY_PREFIX %>.w3s.link

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://bf79c216fe3c72328219f04aabeebc99@o609598.ingest.us.sentry.io/4508456692940801
NEXT_PUBLIC_SENTRY_ORG=storacha-it
NEXT_PUBLIC_SENTRY_PROJECT=bluesky-backup
NEXT_PUBLIC_SENTRY_ENV=<%= $TF_WORKSPACE %>

# Deployment URL, for Bluesky and scheduled backups
NEXT_PUBLIC_APP_URI=https://<% if [ "$TF_WORKSPACE" != "prod" ]; then %><%= "${TF_WORKSPACE}." %><% fi %>bsky.storage

# Stripe
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=<%= $PRICING_TABLE_ID %>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<%= $PUBLISHABLE_KEY %>
# Server did
NEXT_PUBLIC_SERVER_DID=<%= $TF_VAR_did %>

# Humanode
NEXT_PUBLIC_HUMANODE_AUTH_URL=https://auth.storacha-2025-04-22.oauth2.humanode.io/oauth2/auth
NEXT_PUBLIC_HUMANODE_CLIENT_ID=5fe96153-b448-4873-95b3-bb6160223ed6
<%
if [ "$TF_WORKSPACE" != "prod" ]; then
NEXT_PUBLIC_HUMANODE_OAUTH_CALLBACK_URL=https://staging.up.storacha.network/oauth/humanode/callback
else
NEXT_PUBLIC_HUMANODE_OAUTH_CALLBACK_URL=https://up.storacha.network/oauth/humanode/callback
fi
%>