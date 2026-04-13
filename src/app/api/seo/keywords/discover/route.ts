import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { discoverKeywords, analyzeCompetitorGaps } from '@/lib/keyword-research';

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = (await request.json()).catch?.() || {};
    const maxKeywords = body.maxKeywords || 50;
    const focusCategories = body.focusCategories || undefined;

    const discovered = await discoverKeywords({ maxKeywords, focusCategories });
    const gaps = await analyzeCompetitorGaps();

    return NextResponse.json({
      discovered: discovered.length,
      topOpportunities: discovered.slice(0, 10).map((k) => ({
        keyword: k.keyword,
        opportunity: k.opportunity,
        funnel: k.funnelPosition,
        intent: k.intent,
        category: k.category,
      })),
      competitorGaps: gaps.gaps.length,
      gaps: gaps.gaps,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Discovery failed.' },
      { status: 500 },
    );
  }
}
