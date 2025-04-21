import type { NextConfig } from 'next'
import { withYak } from 'next-yak/withYak'

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default withYak(nextConfig)
