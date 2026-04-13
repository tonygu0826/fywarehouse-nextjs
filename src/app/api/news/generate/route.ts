import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { generateOriginalArticle, getRandomTopic } from '@/lib/news-generator';
import { generateArticleWithAI, isAIAvailable } from '@/lib/ai-content-generator';
import { ensureInternalLinks } from '@/lib/seo-optimizer';
import { createArticle } from '@/lib/news';

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as {
      mode: 'original' | 'rewrite';
      keyword?: string;
      category?: string;
      autoPublish?: boolean;
    };

    const topic = body.keyword
      ? { keyword: body.keyword, category: body.category || 'Industry News' }
      : getRandomTopic();

    // Use Claude AI if available, fallback to template
    const generated = isAIAvailable()
      ? await generateArticleWithAI(topic.keyword, topic.category)
      : await generateOriginalArticle(topic.keyword, topic.category);

    const { content, links } = ensureInternalLinks(generated.content, generated.internalLinks);
    const article = await createArticle({
      ...generated,
      content,
      internalLinks: links,
      status: body.autoPublish ? 'published' : 'draft',
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Generation failed.' },
      { status: 500 },
    );
  }
}
