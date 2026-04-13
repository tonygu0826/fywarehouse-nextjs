import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/Container/Container';
import { NewsArticle } from '@/components/News/NewsArticle';
import { NewsArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/SEO/JsonLd';
import { getPublishedArticle, getRelatedNews } from '@/lib/news';
import { extractFaqs } from '@/lib/faq-extractor';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getPublishedArticle(params.slug);
  if (!article) return { title: 'Not Found' };

  const ogImageUrl = `https://www.fywarehouse.com/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}`;

  return {
    title: `${article.title} | FENGYE LOGISTICS News`,
    description: article.metaDescription,
    keywords: [article.targetKeyword, ...article.secondaryKeywords, ...article.tags].filter(Boolean),
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url: `https://www.fywarehouse.com/news/${article.slug}`,
      type: 'article',
      publishedTime: article.publishedAt || undefined,
      modifiedTime: article.updatedAt,
      section: article.category,
      tags: article.tags,
      images: [
        {
          url: article.featuredImage || ogImageUrl,
          alt: article.featuredImageAlt || article.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
      images: [article.featuredImage || ogImageUrl],
    },
    alternates: {
      canonical: `https://www.fywarehouse.com/news/${article.slug}`,
      languages: {
        'en': `https://www.fywarehouse.com/news/${article.slug}`,
        'fr': `https://www.fywarehouse.com/fr/news`,
        'x-default': `https://www.fywarehouse.com/news/${article.slug}`,
      },
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const article = await getPublishedArticle(params.slug);
  if (!article) notFound();

  const relatedNews = await getRelatedNews(params.slug, 3);
  const faqs = extractFaqs(article.content);

  return (
    <Container>
      <NewsArticleJsonLd article={article} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.fywarehouse.com' },
          { name: 'News', url: 'https://www.fywarehouse.com/news' },
          { name: article.title, url: `https://www.fywarehouse.com/news/${article.slug}` },
        ]}
      />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}
      <NewsArticle article={article} relatedNews={relatedNews} />
    </Container>
  );
}
