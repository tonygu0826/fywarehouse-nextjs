import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { NewsList } from '@/components/News/NewsList';
import { NewsSidebar } from '@/components/News/NewsSidebar';
import {
  listArticlesByTag,
  listPublishedArticles,
} from '@/lib/news';
import styles from './TagPage.module.css';

const PAGE_SIZE = 10;

function tagFromSlug(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

function formatTagDisplay(slug: string): string {
  const tag = tagFromSlug(slug);
  return tag
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

type Props = {
  params: { slug: string };
  searchParams: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = formatTagDisplay(params.slug);
  const title = `Articles tagged "${tag}" | FENGYE LOGISTICS`;
  const description = `Browse all articles tagged with "${tag}" from FENGYE LOGISTICS. Industry news, insights, and updates on warehousing and logistics.`;
  const url = `https://www.fywarehouse.com/news/tag/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: `/api/og?title=${encodeURIComponent(title)}&category=News`, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const tagDisplay = formatTagDisplay(params.slug);
  const tagSearch = tagFromSlug(params.slug);

  const articles = await listArticlesByTag(tagSearch);
  const allArticles = await listPublishedArticles();

  const totalCount = articles.length;
  const offset = (page - 1) * PAGE_SIZE;
  const paged = articles.slice(offset, offset + PAGE_SIZE);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.fywarehouse.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News',
        item: 'https://www.fywarehouse.com/news',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `Tag: ${tagDisplay}`,
        item: `https://www.fywarehouse.com/news/tag/${params.slug}`,
      },
    ],
  };

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.separator}>/</span>
          <Link href="/news">News</Link>
          <span className={styles.separator}>/</span>
          <span>Tag: {tagDisplay}</span>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Tag: {tagDisplay}</h1>
          <p className={styles.description}>
            All articles tagged with &ldquo;{tagDisplay}&rdquo;.
          </p>
        </header>

        {totalCount === 0 ? (
          <div className={styles.empty}>
            <p>No articles found with this tag yet.</p>
            <Link href="/news" className={styles.backLink}>
              &larr; Back to all news
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            <NewsList
              articles={paged}
              page={page}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
            />
            <div className={styles.sidebarWrap}>
              <NewsSidebar articles={allArticles} />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
