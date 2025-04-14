import type { NextConfig } from 'next'
import { withYak } from 'next-yak/withYak'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  // webpack: (config, ctx) => {
  //   // console.log(ctx.nextRuntime)
  //   if (ctx.nextRuntime === 'nodejs') {
  //     // console.log('config.externals', config.externals)
  //     // console.log('config.entry', config.entry())
  //     // config.externals.push('cloudflare:workers')
  //     const previousEntry = config.entry
  //     config.entry = async () => {
  //       const entries = await previousEntry()
  //       entries.durableObject = './src/durable-objects/MyDurableObject.ts'
  //       return entries
  //     }
  //   }
  //   return config
  // },
}

export default withYak(nextConfig)
