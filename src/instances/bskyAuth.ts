import { BrowserOAuthClient } from "@atproto/oauth-client-browser";

const bskyAuthClient = new BrowserOAuthClient({
  handleResolver: "https://bsky.social",
});

export { bskyAuthClient };
