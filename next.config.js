/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    PYPE_API_URL: process.env.PYPE_API_URL || 'http://localhost:18080',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.PYPE_API_URL || 'http://localhost:18080'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig