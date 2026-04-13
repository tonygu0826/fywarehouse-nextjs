import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { NewsList } from '@/components/News/NewsList';
import { NewsSidebar } from '@/components/News/NewsSidebar';
import {
  listArticlesByCategory,
  listPublishedArticles,
  listCategories,
  categorySlugify,
} from '@/lib/news';
import styles from './CategoryPage.module.css';

const PAGE_SIZE = 10;

// Known categories for static generation
const KNOWN_CATEGORIES = [
  'Customs & Regulations',
  'Industry Trends',
  'Warehouse Operations',
  'Trade & Commerce',
];

export async function generateStaticParams() {
  const categories = await listCategories();
  const slugs = new Set<string>();

  for (const cat of categories) {
    slugs.add(cat.slug);
  }
  for (const name of KNOWN_CATEGORIES) {
    slugs.add(categorySlugify(name));
  }

  return Array.from(slugs).map((slug) => ({ slug }));
}

function categoryNameFromSlug(slug: string): string {
  for (const name of KNOWN_CATEGORIES) {
    if (categorySlugify(name) === slug) return name;
  }
  // Fallback: capitalise each word
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

type Props = {
  params: { slug: string };
  searchParams: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = categoryNameFromSlug(params.slug);
  const title = `${name} News | FENGYE LOGISTICS`;
  const description = `Browse all ${name.toLowerCase()} news and articles from FENGYE LOGISTICS. Expert insights on warehousing, logistics, and supply chain management.`;
  const url = `https://www.fywarehouse.com/news/category/${params.slug}`;

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

export default async function CategoryPage({ params, searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const categoryName = categoryNameFromSlug(params.slug);

  const articles = await listArticlesByCategory(params.slug);
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
        name: categoryName,
        item: `https://www.fywarehouse.com/news/category/${params.slug}`,
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
          <span>{categoryName}</span>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>{categoryName}</h1>
          <p className={styles.description}>
            Browse all articles in the {categoryName.toLowerCase()} category.
          </p>
        </header>

        {totalCount === 0 ? (
          <div className={styles.empty}>
            <p>No articles found in this category yet.</p>
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
              <NewsSidebar
                articles={allArticles}
                currentCategory={categoryName}
              />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
