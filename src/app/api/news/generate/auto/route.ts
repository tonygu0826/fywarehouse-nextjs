import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { runContentPipeline } from '@/lib/content-pipeline';


// Cron-triggered endpoint for daily auto-generation
// Configure Cloudflare Workers Cron to call this daily
export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const dailyCount = parseInt(process.env.NEWS_DAILY_COUNT || '3', 10);
    const autoPublish = process.env.NEWS_AUTO_PUBLISH === 'true';

    const result = await runContentPipeline({
      dailyCount,
      autoPublish,
      mixRatio: 0.6,
    });

    return NextResponse.json({
      message: `Auto-generation complete: ${result.generated} generated, ${result.published} published`,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Auto-generation failed.' },
      { status: 500 },
    );
  }
}

// GET for status check
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    config: {
      dailyCount: process.env.NEWS_DAILY_COUNT || '3',
      autoPublish: process.env.NEWS_AUTO_PUBLISH || 'false',
    },
  });
}
