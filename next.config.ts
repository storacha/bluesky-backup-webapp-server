import { withYak } from 'next-yak/withYak'
import { version } from './package.json'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    version,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipfs.w3s.link',
      },
      {
        protocol: 'https',
        hostname: '**.staging-ipfs.w3s.link',
      },
    ],
  },
}

export default withYak(nextConfig)
