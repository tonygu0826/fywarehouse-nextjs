import { NextResponse } from 'next/server';
import { createArticle, publishArticle } from '@/lib/news';

// Arvow Webhook receiver
// Arvow sends completed articles here via POST with X-Secret header

export async function POST(request: Request) {
  // Verify webhook secret
  const secret = request.headers.get('X-Secret') || request.headers.get('x-secret');
  const expectedSecret = process.env.ARVOW_WEBHOOK_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    console.error('Arvow webhook: invalid secret');
    return NextResponse.json({ message: 'Invalid secret.' }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // Arvow sends article data in various formats depending on integration
    // Handle both single article and batch
    const articles = Array.isArray(payload) ? payload : payload.articles || [payload];

    const results: Array<{ slug: string; title: string }> = [];

    for (const item of articles) {
      // Extract article data from Arvow payload
      const title = item.title || item.headline || '';
      const content = item.html || item.content || item.body || '';
      const metaDescription = item.metaDescription || item.meta_description || item.description || '';
      const keyword = item.keyword || item.focusKeyword || item.focus_keyword || '';
      const category = item.category || 'Industry News';
      const tags = item.tags || [];

      if (!title || !content) {
        console.warn('Arvow webhook: skipping article without title or content');
        continue;
      }

      const autoPublish = process.env.NEWS_AUTO_PUBLISH === 'true';

      const article = await createArticle({
        title,
        content,
        metaDescription,
        targetKeyword: keyword,
        category,
        tags: Array.isArray(tags) ? tags : [tags],
        source: 'external',
        sourceUrl: item.url || item.sourceUrl || null,
        author: 'FENGYE LOGISTICS',
        status: autoPublish ? 'published' : 'draft',
      });

      if (autoPublish && article.status === 'draft') {
        await publishArticle(article.slug);
      }

      results.push({ slug: article.slug, title: article.title });
    }

    console.log(`Arvow webhook: received ${results.length} article(s)`);
    return NextResponse.json({
      received: results.length,
      articles: results,
    }, { status: 201 });
  } catch (error) {
    console.error('Arvow webhook error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Webhook processing failed.' },
      { status: 500 },
    );
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: 'ready', service: 'arvow-webhook' });
}
