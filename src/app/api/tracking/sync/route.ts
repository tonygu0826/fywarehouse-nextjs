import { NextResponse } from 'next/server';
import { syncShipments } from '@/lib/borderconnect';

// GET /api/tracking/sync — Pull latest RNS messages from BorderConnect
// Can be called by cron job to keep local data fresh
export async function GET() {
  try {
    const count = await syncShipments();
    return NextResponse.json({ success: true, synced: count });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
