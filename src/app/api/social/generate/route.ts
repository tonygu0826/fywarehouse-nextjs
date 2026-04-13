import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getArticle } from '@/lib/news';
import { generateAllPlatformContent } from '@/lib/social-content-generator';


export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = (await request.json()) as { slug: string };
    if (!slug) {
      return NextResponse.json({ message: 'slug is required.' }, { status: 400 });
    }

    const article = await getArticle(slug);
    if (!article) {
      return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    }

    const contents = generateAllPlatformContent(article);
    return NextResponse.json({ contents });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Generation failed.' },
      { status: 500 },
    );
  }
}
