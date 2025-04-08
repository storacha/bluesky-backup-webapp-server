import type { NextConfig } from 'next'
import { withYak } from 'next-yak/withYak'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {}

export default withYak(nextConfig)
