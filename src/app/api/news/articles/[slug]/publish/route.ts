import { NextResponse } from 'next/server';
import { publishArticle } from '@/lib/news';
import { requireApiKey } from '@/lib/api-auth';


type RouteContext = {
  params: { slug: string };
};

export async function POST(request: Request, { params }: RouteContext) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const article = await publishArticle(params.slug);
    return NextResponse.json({ article });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to publish article.';
    const status = message === 'Article not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
