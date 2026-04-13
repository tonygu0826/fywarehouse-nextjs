import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getArticle } from '@/lib/news';
import { scheduleNewsToSocial } from '@/lib/social-scheduler';


export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { slug, scheduledAt } = (await request.json()) as {
      slug: string;
      scheduledAt?: string;
    };

    if (!slug) {
      return NextResponse.json({ message: 'slug is required.' }, { status: 400 });
    }

    const article = await getArticle(slug);
    if (!article) {
      return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    }

    const result = await scheduleNewsToSocial(article, scheduledAt);

    if (!result) {
      return NextResponse.json(
        { message: 'Blotato is not configured. Set BLOTATO_API_KEY to enable social scheduling.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Scheduling failed.' },
      { status: 500 },
    );
  }
}
