# copy to .env.terraform and set missing vars
TF_WORKSPACE= #your name here
TF_VAR_app=bluesky
TF_VAR_domain_base=bsky.storage
TF_VAR_did= # did for your env
TF_VAR_private_key= # private_key or your env -- do not commit to repo!
# dummy key that should not be used in production
TF_VAR_atproto_jwk='{"kty":"EC","kid":"f704a86a-b858-4791-90a2-30425e03c96e","use":"sig","crv":"P-256","x":"EJ4ehTRGd4xj7mQoUCCdlKeGuODGGuA4rhBoUmBrF3Y","y":"PvOHE74RSV8U9XrDP-U8kLWpfGi6v6FqXreV5_8SRAU","d":"plFqVSZlMobvJujryGvT5E6Lzs7bRKFAn3Vs2tgwSbw"}'
TF_VAR_allowed_account_id=505595374361
TF_VAR_region=us-west-2
