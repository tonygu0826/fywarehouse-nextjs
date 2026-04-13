import type { Metadata } from 'next';
import { Container } from '@/components/Container/Container';
import { NewsList } from '@/components/News/NewsList';
import { NewsSidebar } from '@/components/News/NewsSidebar';
import { listPublishedArticles } from '@/lib/news';

const PAGE_SIZE = 10;
const BASE_URL = 'https://www.fywarehouse.com/news';

type Props = {
  searchParams: { page?: string; category?: string; tag?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const allArticles = await listPublishedArticles();

  // Apply same filters as the page component
  let filtered = allArticles;
  if (searchParams.category) {
    filtered = filtered.filter((a) => a.category === searchParams.category);
  }
  if (searchParams.tag) {
    filtered = filtered.filter((a) => a.tags.includes(searchParams.tag!));
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageTitle = page > 1
    ? `Industry News - Page ${page} | FENGYE LOGISTICS`
    : 'Industry News | FENGYE LOGISTICS';

  // Build canonical URL with page parameter for pages > 1
  const canonicalUrl = page > 1 ? `${BASE_URL}?page=${page}` : BASE_URL;

  // Build prev/next link relations
  const linkRelations: Record<string, string> = {};
  if (page > 1) {
    linkRelations.prev = page === 2 ? BASE_URL : `${BASE_URL}?page=${page - 1}`;
  }
  if (page < totalPages) {
    linkRelations.next = `${BASE_URL}?page=${page + 1}`;
  }

  return {
    title: pageTitle,
    description:
      'Stay updated with the latest warehousing, logistics, and supply chain news from Montreal and beyond. Expert insights on customs, distribution, and freight from FENGYE LOGISTICS.',
    openGraph: {
      title: pageTitle,
      description:
        'Stay updated with the latest warehousing, logistics, and supply chain news.',
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description:
        'Stay updated with the latest warehousing, logistics, and supply chain news.',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: 'https://www.fywarehouse.com/news',
        fr: 'https://www.fywarehouse.com/fr/news',
      },
      types: {
        'application/rss+xml': 'https://www.fywarehouse.com/feed.xml',
      },
    },
    other: linkRelations,
  };
}

export default async function NewsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const allArticles = await listPublishedArticles();

  // Filter by category or tag
  let filtered = allArticles;
  if (searchParams.category) {
    filtered = filtered.filter((a) => a.category === searchParams.category);
  }
  if (searchParams.tag) {
    filtered = filtered.filter((a) => a.tags.includes(searchParams.tag!));
  }

  const totalCount = filtered.length;
  const offset = (page - 1) * PAGE_SIZE;
  const articles = filtered.slice(offset, offset + PAGE_SIZE);

  const activeFilter = searchParams.category || searchParams.tag || null;

  return (
    <Container>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(28px, 3.5vw, 36px)',
              fontWeight: 700,
              color: 'var(--color-title)',
            }}
          >
            {activeFilter ? `News: ${activeFilter}` : 'Industry News'}
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--color-text)',
            }}
          >
            The latest updates on warehousing, logistics, customs, and supply chain
            management in Montreal and across Canada.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', alignItems: 'start' }}>
          <NewsList
            articles={articles}
            page={page}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
          />
          <div style={{ position: 'sticky', top: '24px' }}>
            <NewsSidebar
              articles={allArticles}
              currentCategory={searchParams.category}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 727px) {
          div[style*="grid-template-columns"] {
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </Container>
  );
}
