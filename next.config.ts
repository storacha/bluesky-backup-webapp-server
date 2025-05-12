import { withYak } from 'next-yak/withYak'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
