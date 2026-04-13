import type { MetadataRoute } from 'next';
import { listPublishedArticles, listCategories } from '@/lib/news';

// Inline to avoid cross-module import issues at runtime
function categorySlugify(name: string): string {
  return name.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const SERVICE_SLUGS = [
  'in-bond-cargo-handling',
  'consolidation-deconsolidation',
  'warehousing-distribution',
  'local-delivery',
  'repalletizing-recrating',
];

const LOCATION_SLUGS = [
  'montreal-warehouse',
  'quebec-logistics',
  'montreal-customs-broker',
  'canada-freight-forwarding',
  'montreal-sufferance-warehouse',
];

export const dynamic = 'force-dynamic';

const BASE = 'https://www.fywarehouse.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fixed dates for static content — avoids Google ignoring always-changing lastmod
  const STATIC_LASTMOD = new Date('2026-03-15'); // last major content update
  const TAXONOMY_LASTMOD = new Date('2026-04-01'); // last category/tag update

  // ── English core pages ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE}/services`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/locations`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/about`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/contact`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/tracking`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/feed.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.3,
    },
  ];

  // ── English service pages ──
  const servicePages: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // ── English location pages ──
  const locationPages: MetadataRoute.Sitemap = LOCATION_SLUGS.map((slug) => ({
    url: `${BASE}/locations/${slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // ── News category pages ──
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await listCategories();
    categoryPages = categories.map((cat) => ({
      url: `${BASE}/news/category/${categorySlugify(cat.name)}`,
      lastModified: TAXONOMY_LASTMOD,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // skip if no categories
  }

  // ── News article pages ──
  const articles = await listPublishedArticles();
  const newsPages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE}/news/${article.slug}`,
    lastModified: new Date(article.publishedAt || article.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ── News tag pages ──
  const allTags = new Set<string>();
  articles.forEach((a) => a.tags?.forEach((t: string) => allTags.add(t)));
  const tagPages: MetadataRoute.Sitemap = Array.from(allTags).map((tag) => ({
    url: `${BASE}/news/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`,
    lastModified: TAXONOMY_LASTMOD,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // ── French pages ──
  const frenchPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/fr`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/fr/services`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/fr/locations`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/fr/about`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/fr/contact`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/fr/tracking`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE}/fr/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const frenchServicePages: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE}/fr/services/${slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const frenchLocationPages: MetadataRoute.Sitemap = LOCATION_SLUGS.map((slug) => ({
    url: `${BASE}/fr/locations/${slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...frenchPages,
    ...servicePages,
    ...frenchServicePages,
    ...locationPages,
    ...frenchLocationPages,
    ...categoryPages,
    ...newsPages,
    ...tagPages,
  ];
}

// Video sitemap is served separately at /video-sitemap.xml (see src/app/video-sitemap.xml/route.ts)
// It is also referenced in robots.ts
