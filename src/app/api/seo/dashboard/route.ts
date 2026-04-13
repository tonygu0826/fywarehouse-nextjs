import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { generateDashboardReport } from '@/lib/seo-dashboard';

// GET /api/seo/dashboard — comprehensive SEO health report
export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const report = await generateDashboardReport();

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to generate SEO dashboard report.',
        hint: 'Ensure Google Search Console credentials are configured in data/gsc-service-account.json',
      },
      { status: 500 },
    );
  }
}
