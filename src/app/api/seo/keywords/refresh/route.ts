import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { refreshAllKeywordsWithRealData, isGoogleAdsApiAvailable } from '@/lib/keyword-api';

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  if (!isGoogleAdsApiAvailable()) {
    return NextResponse.json(
      {
        message:
          'Google Ads API is not configured. Set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CUSTOMER_ID in .env.local',
      },
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const recalculateOpportunity = body.recalculateOpportunity !== false;

    const result = await refreshAllKeywordsWithRealData({ recalculateOpportunity });

    return NextResponse.json(
      {
        message: 'Keyword metrics refreshed with real Google Ads data',
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Refresh failed.' },
      { status: 500 },
    );
  }
}
