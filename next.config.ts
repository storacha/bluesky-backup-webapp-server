import type { NextConfig } from 'next'
import { withYak } from 'next-yak/withYak'

const nextConfig: NextConfig = {
  output: 'standalone',
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
