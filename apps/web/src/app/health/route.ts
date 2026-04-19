import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Liveness probe. Returns minimal, non-sensitive info.
 * Monitoring (UptimeRobot / BetterStack) should hit this every 60s.
 */
export function GET(): NextResponse {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'privaforge-web',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
