import type { Metadata } from 'next';
import { Container } from '@/components/Container/Container';
import { NewsList } from '@/components/News/NewsList';
import { NewsSidebar } from '@/components/News/NewsSidebar';
import { listPublishedArticles } from '@/lib/news';
import { getTranslations } from '@/lib/i18n';

const PAGE_SIZE = 10;
const t = getTranslations('fr');

type Props = {
  searchParams: { page?: string; category?: string; tag?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const pageTitle = page > 1
    ? `Actualit\u00e9s de l'industrie - Page ${page} | FENGYE LOGISTICS`
    : 'Actualit\u00e9s de l\'industrie | FENGYE LOGISTICS';

  return {
    title: pageTitle,
    description:
      'Restez inform\u00e9 des derni\u00e8res nouvelles sur l\'entreposage, la logistique, les douanes et la gestion de la cha\u00eene d\'approvisionnement \u00e0 Montr\u00e9al et partout au Canada.',
    openGraph: {
      title: pageTitle,
      description:
        'Restez inform\u00e9 des derni\u00e8res nouvelles sur l\'entreposage, la logistique et la cha\u00eene d\'approvisionnement.',
      url: 'https://www.fywarehouse.com/fr/news',
      type: 'website',
      locale: 'fr_CA',
    },
    alternates: {
      canonical: 'https://www.fywarehouse.com/fr/news',
      languages: {
        en: 'https://www.fywarehouse.com/news',
        fr: 'https://www.fywarehouse.com/fr/news',
      },
    },
  };
}

export default async function FrNewsPage({ searchParams }: Props) {
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
            {activeFilter ? `Actualit\u00e9s\u00a0: ${activeFilter}` : t.news.title}
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--color-text)',
            }}
          >
            {t.news.description}
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
