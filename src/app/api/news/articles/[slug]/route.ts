import { NextResponse } from 'next/server';
import { getArticle, updateArticle, deleteArticle, type ArticleInput } from '@/lib/news';
import { requireApiKey } from '@/lib/api-auth';


type RouteContext = {
  params: { slug: string };
};

export async function GET(request: Request, { params }: RouteContext) {
  const article = await getArticle(params.slug);
  if (!article) {
    return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
  }
  // Unauthenticated requests can only see published articles
  const isAuthenticated = requireApiKey(request) === null;
  if (!isAuthenticated && article.status !== 'published') {
    return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const payload = (await request.json()) as Partial<ArticleInput>;
    const article = await updateArticle(params.slug, payload);
    return NextResponse.json({ article });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update article.';
    const status = message === 'Article not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    await deleteArticle(params.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete article.';
    const status = message === 'Article not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
