import { NextResponse } from 'next/server';

/**
 * Runtime configuration endpoint
 * Returns environment variables that need to be accessible at runtime
 * This allows the frontend to get config values without baking them into the build
 */
export async function GET() {
  const config = {
    PYPE_API_URL: process.env.PYPE_API_URL || 'http://localhost:8080',
  };

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}
