import type { NextConfig } from 'next'
import { withYak } from 'next-yak/withYak'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'upload.wikimedia.org',
        protocol: 'https',
        pathname: '/**',
      },
    ],
  },
}

export default withYak(nextConfig)
