# blusky-backup-webapp

HOT HOT HOT backups for your ATProto PDS

## Local development

### Set up `ngrok`

1. Run `pnpm dev`.
2. In another terminal, run `script/start-tunnel`.
   - (optional) You may want to set up a [static domain in ngrok](https://dashboard.ngrok.com/domains). Once you've set up a static domain, you can use it by instead running `script/start-tunnel --url spicy-rooster-fondly.ngrok-free.app` (replacing the URL with your own).
3. Visit your forwarding URL in the browser.

### Storybook

For many types of UI development you don't need a running app. Simply run `pnpm storybook` and visit `http://localhost:6006` to see our Storybook.
