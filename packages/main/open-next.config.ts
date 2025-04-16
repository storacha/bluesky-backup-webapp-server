// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache'

const config: ReturnType<typeof defineCloudflareConfig> =
  defineCloudflareConfig({
    incrementalCache: kvIncrementalCache,
  })

export default config
