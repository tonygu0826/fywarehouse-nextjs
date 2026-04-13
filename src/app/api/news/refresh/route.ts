import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { refreshArticle, batchRefresh } from '@/lib/content-refresher';

// POST: refresh specific article or batch
export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Single article refresh
    if (body.slug) {
      const result = await refreshArticle(body.slug);
      return NextResponse.json({ result });
    }

    // Batch refresh
    const maxArticles = body.maxArticles || 5;
    const results = await batchRefresh(maxArticles);
    return NextResponse.json({
      message: `Refreshed ${results.length} article(s)`,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Refresh failed.' },
      { status: 500 },
    );
  }
}
