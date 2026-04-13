import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import {
  isGbpConfigured,
  generateGbpPostFromArticle,
  publishArticleToGbp,
  type GbpPostType,
} from '@/lib/gbp-poster';
import { getArticle } from '@/lib/news';

// GET /api/social/gbp — check GBP configuration status
export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  return NextResponse.json({
    configured: isGbpConfigured(),
    message: isGbpConfigured()
      ? 'GBP is configured and ready to post.'
      : 'GBP is not configured. Set GBP_ACCOUNT_ID, GBP_LOCATION_ID, GBP_CLIENT_ID, GBP_CLIENT_SECRET environment variables.',
    requiredEnvVars: [
      'GBP_ACCOUNT_ID',
      'GBP_LOCATION_ID',
      'GBP_CLIENT_ID',
      'GBP_CLIENT_SECRET',
      'GBP_ACCESS_TOKEN (or GBP_REFRESH_TOKEN)',
    ],
  });
}

// POST /api/social/gbp — create a GBP post for an article
// Body: { slug: string, postType?: 'STANDARD' | 'EVENT' | 'OFFER', preview?: boolean }
export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { slug, postType = 'STANDARD', preview = false } = body;

    if (!slug) {
      return NextResponse.json({ message: 'Missing article slug.' }, { status: 400 });
    }

    const article = await getArticle(slug);
    if (!article) {
      return NextResponse.json({ message: `Article "${slug}" not found.` }, { status: 404 });
    }

    // Preview mode: return the post content without publishing
    if (preview) {
      const post = generateGbpPostFromArticle(article, postType as GbpPostType);
      return NextResponse.json({
        preview: true,
        post,
        message: 'Preview only — not published to GBP.',
      });
    }

    // Publish to GBP
    const result = await publishArticleToGbp(article, postType as GbpPostType);

    if (result.success) {
      return NextResponse.json({
        message: `GBP post created for "${article.title}"`,
        postName: result.postName,
      });
    }

    return NextResponse.json(
      { message: result.error || 'Failed to create GBP post.' },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create GBP post.' },
      { status: 500 },
    );
  }
}
