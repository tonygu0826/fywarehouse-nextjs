import { NextResponse } from 'next/server';
import { refreshAllKeywordsWithRealData, isGoogleAdsApiAvailable } from '@/lib/keyword-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  try {
    if (!isGoogleAdsApiAvailable()) {
      return NextResponse.json(
        { error: 'Google Ads API not configured. Check environment variables.' },
        { status: 503 },
      );
    }

    const result = await refreshAllKeywordsWithRealData({ recalculateOpportunity: true });

    return NextResponse.json({
      success: true,
      message: `Refreshed ${result.updated} keywords with real Google data (${result.skipped} skipped, ${result.total} total)`,
      ...result,
    });
  } catch (error) {
    console.error('[keywords/refresh] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
