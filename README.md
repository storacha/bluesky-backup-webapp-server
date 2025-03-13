# blusky-backup-webapp

HOT HOT HOT backups for your ATProto PDS

## Local development

### Set up `ngrok`

1. Install `ngrok`: https://ngrok.com/downloads/
2. Run `pnpm dev` in the root of this repository
3. In another terminal, run `ngrok http http://localhost:3000`
4. Copy the "forwarding" URL into your `.env.local` file as the value of `NEXT_PUBLIC_BLUESKY_CLIENT_URI`:
```
# look for this line in ngrok output:
Forwarding                    https://c5a1-157-131-19-230.ngrok-free.app -> http://localhost:3000

# and copy it into .env.local like:

NEXT_PUBLIC_BLUESKY_CLIENT_URI=https://c5a1-157-131-19-230.ngrok-free.app
```
5. Visit your forwarding URL in the browser.
6. (optional) You may want to set up a [static domain in ngrok](https://dashboard.ngrok.com/domains). If you've set up a static domain, you'll start ngrok like this (change out the URL for your static URL of course):
```
ngrok http http://localhost:3000 --url spicy-rooster-fondly.ngrok-free.app
```


### Storybook

For many types of UI development you don't need a running app. Simply run `pnpm storybook` in the root of this repository and visit `http://localhost:6006` to see our Storybook.
