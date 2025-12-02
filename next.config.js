/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Remove env from here - we'll use runtime config instead
  // This prevents baking the URL into the build
  async rewrites() {
    // Note: rewrites still use build-time env for SSR
    // But client-side will use the /api/config endpoint
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.PYPE_API_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig