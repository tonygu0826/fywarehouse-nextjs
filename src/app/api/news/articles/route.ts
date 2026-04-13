import { NextResponse } from 'next/server';
import { createArticle, listArticles, type ArticleInput } from '@/lib/news';
import { requireApiKey } from '@/lib/api-auth';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  // Unauthenticated requests can only see published articles
  // Authenticated requests can filter by status
  const authResult = requireApiKey(request);
  const isAuthenticated = authResult === null;
  const requestedStatus = searchParams.get('status') as 'draft' | 'published' | 'archived' | null;
  const status = isAuthenticated ? (requestedStatus || undefined) : 'published';

  const articles = await listArticles({
    ...(status && { status }),
    ...(category && { category }),
    ...(limit && { limit: parseInt(limit, 10) }),
    ...(offset && { offset: parseInt(offset, 10) }),
  });

  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const payload = (await request.json()) as ArticleInput;
    const article = await createArticle(payload);
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to create article.' },
      { status: 400 },
    );
  }
}
