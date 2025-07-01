<%
# Don't mess with this file -- it will auto compile to env.production.local
if [ "$TF_WORKSPACE" != "prod" ]; then
  UPLOAD_PREFIX="staging."
  GATEWAY_PREFIX="-staging"
  STORACHA_DID="staging.up.storacha.network"
  UCAN_VALIDATOR_PROOF="mAYIEAJ0DOqJlcm9vdHOB2CpYJQABcRIgesnvpVxeUeE1mgatACpGpHIyAA6HXqbx/+2Pa05RfGFndmVyc2lvbgGGAgFxEiBrBJco5crEGfk348jGWMJs50GykJaV1BOO23f3p2Nrcqdhc1hE7aEDQM4gQKNs+tktd/79XLZ7qd0tSvWX/aJrNRdBBHnb93Lth8Pl1QIMKTvd9fyT0izlidgVNWg7KznHZ5Y+v649hARhdmUwLjkuMWNhdHSBomNjYW5rdWNhbi9hdHRlc3Rkd2l0aHgjZGlkOndlYjpzdGFnaW5nLnVwLnN0b3JhY2hhLm5ldHdvcmtjYXVkWBqdGndlYjpzdGFnaW5nLndlYjMuc3RvcmFnZWNleHD2Y2lzc1ghnRp3ZWI6c3RhZ2luZy51cC5zdG9yYWNoYS5uZXR3b3JrY3ByZoBZAXESIHrJ76VcXlHhNZoGrQAqRqRyMgAOh16m8f/tj2tOUXxhoWp1Y2FuQDAuOS4x2CpYJQABcRIgawSXKOXKxBn5N+PIxljCbOdBspCWldQTjtt396dja3I"
  PRICING_TABLE_ID="prctbl_1R1egaF6A5ufQX5vyumO9QAf"
  PUBLISHABLE_KEY="pk_test_51LO87hF6A5ufQX5viNsPTbuErzfavdrEFoBuaJJPfoIhzQXdOUdefwL70YewaXA32ZrSRbK4U4fqebC7SVtyeNcz00qmgNgueC"
  HUMANODE_OAUTH_CALLBACK_URL=https://staging.up.storacha.network/oauth/humanode/callback
else
  UPLOAD_PREFIX=""
  GATEWAY_PREFIX=""
  STORACHA_DID="web3.storage"
  UCAN_VALIDATOR_PROOF="mAYIEAPwCOqJlcm9vdHOB2CpYJQABcRIg9iw41it7Jsxlz6NvbUspKWP9Aru4IhG0Q+NJF1n7eg5ndmVyc2lvbgHlAQFxEiApGTXwUIEpNL3pyot+NYDPeWzrxpP4cMoUtCKYiFMWiKdhc1hE7aEDQGr39ZRusnpMooPeQ2DSR0PnufbfmR1iR6hFjTNr/E6ZSStd0cHNuRW9/1YirpdLVweHavWGrfHUOZS95qaXHwJhdmUwLjkuMWNhdHSBomNjYW5rdWNhbi9hdHRlc3Rkd2l0aHRkaWQ6d2ViOndlYjMuc3RvcmFnZWNhdWRYGZ0ad2ViOnVwLnN0b3JhY2hhLm5ldHdvcmtjZXhw9mNpc3NSnRp3ZWI6d2ViMy5zdG9yYWdlY3ByZoBZAXESIPYsONYreybMZc+jb21LKSlj/QK7uCIRtEPjSRdZ+3oOoWp1Y2FuQDAuOS4x2CpYJQABcRIgKRk18FCBKTS96cqLfjWAz3ls68aT+HDKFLQimIhTFog"
  PRICING_TABLE_ID="prctbl_1R58oLF6A5ufQX5vozallJKX"
  PUBLISHABLE_KEY="pk_live_51LO87hF6A5ufQX5vQTO5BHyz8y9ybJp4kg1GsBjYuqwluuwtQTkbeZzkoQweFQDlv7JaGjuIdUWAyuwXp3tmCfsM005lJK9aS8"
  HUMANODE_OAUTH_CALLBACK_URL=https://up.storacha.network/oauth/humanode/callback
fi
%>

# set these to your upload API service URL and the DID your service is using as its service DID
NEXT_PUBLIC_STORACHA_SERVICE_URL=https://<%= $UPLOAD_PREFIX %>up.storacha.network
NEXT_PUBLIC_STORACHA_RECEIPTS_URL=https://<%= $UPLOAD_PREFIX %>up.storacha.network/receipt/
NEXT_PUBLIC_STORACHA_SERVICE_DID=did:web:<%= $STORACHA_DID %>
NEXT_PUBLIC_STORACHA_PROVIDER=did:web:<%= $STORACHA_DID %>
NEXT_PUBLIC_IDENTITY_AUTHORITY=did:web:<%= $STORACHA_DID %>
NEXT_PUBLIC_UCAN_VALIDATOR_PROOF=<%= $UCAN_VALIDATOR_PROOF %>

# set these to your gateway service URL and DID 
NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME=ipfs<%= $GATEWAY_PREFIX %>.w3s.link
NEXT_PUBLIC_STORACHA_GATEWAY_ID=did:web:ipfs<%= $GATEWAY_PREFIX %>.w3s.link

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://5d497dd98801ee03b51fa1abe107f244@o609598.ingest.us.sentry.io/4509594763788288
NEXT_PUBLIC_SENTRY_ORG=storacha-it
NEXT_PUBLIC_SENTRY_PROJECT=bskystorage
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
NEXT_PUBLIC_HUMANODE_OAUTH_CALLBACK_URL=<%= $HUMANODE_OAUTH_CALLBACK_URL %>
