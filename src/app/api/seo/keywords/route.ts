import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getKeywordStorage, type KeywordFilter } from '@/lib/keyword-store';

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const filter: KeywordFilter = {
    ...(searchParams.get('status') && { status: searchParams.get('status') as KeywordFilter['status'] }),
    ...(searchParams.get('funnel') && { funnelPosition: searchParams.get('funnel') as KeywordFilter['funnelPosition'] }),
    ...(searchParams.get('intent') && { intent: searchParams.get('intent') as KeywordFilter['intent'] }),
    ...(searchParams.get('category') && { category: searchParams.get('category')! }),
    ...(searchParams.get('minOpp') && { minOpportunity: parseInt(searchParams.get('minOpp')!, 10) }),
    ...(searchParams.get('limit') && { limit: parseInt(searchParams.get('limit')!, 10) }),
  };

  const keywords = await getKeywordStorage().list(filter);
  return NextResponse.json({ keywords, count: keywords.length });
}

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Bulk import keywords
    if (Array.isArray(body.keywords)) {
      const storage = getKeywordStorage();
      let imported = 0;
      for (const kw of body.keywords) {
        if (!kw.keyword) continue;
        const existing = await storage.getByKeyword(kw.keyword);
        if (existing) continue;
        await storage.save({
          id: crypto.randomUUID(),
          keyword: kw.keyword,
          searchVolume: kw.searchVolume || 0,
          difficulty: kw.difficulty || 50,
          funnelPosition: kw.funnelPosition || 'middle',
          intent: kw.intent || 'informational',
          opportunity: kw.opportunity || 50,
          status: 'discovered',
          relatedNewsSlug: null,
          source: kw.source || 'manual-import',
          category: kw.category || 'Industry Trends',
          tags: kw.tags || [],
          lastUsed: null,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        imported++;
      }
      return NextResponse.json({ imported }, { status: 201 });
    }

    return NextResponse.json({ message: 'Provide { keywords: [...] } array.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Import failed.' },
      { status: 400 },
    );
  }
}
