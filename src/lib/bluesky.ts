import { OAuthClientMetadataInput } from "@atproto/oauth-client-browser";

export const blueskyClientUri = process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI || "https://localhost:3000/"

export const blueskyClientMetadata: OAuthClientMetadataInput = {
    "client_id": `${blueskyClientUri}bluesky-client-metadata`,
    "client_name": "Local Dev App",
    "client_uri": blueskyClientUri,
    "application_type": "web",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": [blueskyClientUri],
    "token_endpoint_auth_method": "none",
    "scope": "atproto transition:generic",
    "dpop_bound_access_tokens": true

}