// Content clustering system
// Groups articles into topic clusters with pillar pages
// Boosts topical authority for SEO

import { listArticles, type NewsArticleSummary } from './news';

export type ContentCluster = {
  name: string;
  slug: string;
  description: string;
  pillarKeyword: string;
  articles: NewsArticleSummary[];
  articleCount: number;
};

// Define topic clusters based on business focus areas
const CLUSTER_DEFINITIONS = [
  {
    name: 'Customs & Bonded Warehousing',
    slug: 'customs-warehousing',
    description: 'Everything about sufferance warehouses, customs clearance, CBSA regulations, and bonded storage in Canada.',
    pillarKeyword: 'sufferance warehouse Montreal',
    matchTerms: ['customs', 'bonded', 'sufferance', 'cbsa', 'carm', 'clearance', 'import', 'export', 'duty', 'tariff'],
  },
  {
    name: 'Montreal Logistics & Distribution',
    slug: 'montreal-logistics',
    description: 'Logistics operations, distribution services, and freight management in the Greater Montreal Area.',
    pillarKeyword: 'Montreal logistics services',
    matchTerms: ['montreal', 'logistics', 'distribution', 'freight', 'port', 'shipping', 'transport', '3pl'],
  },
  {
    name: 'E-Commerce Fulfillment',
    slug: 'ecommerce-fulfillment',
    description: 'E-commerce warehousing, order fulfillment, last-mile delivery, and online retail logistics.',
    pillarKeyword: 'e-commerce fulfillment warehouse Canada',
    matchTerms: ['e-commerce', 'ecommerce', 'fulfillment', 'online', 'last mile', 'order', 'retail'],
  },
  {
    name: 'Warehouse Operations & Technology',
    slug: 'warehouse-operations',
    description: 'Warehouse management best practices, automation, WMS technology, and operational efficiency.',
    pillarKeyword: 'warehouse management best practices',
    matchTerms: ['automation', 'wms', 'technology', 'management', 'inventory', 'operations', 'efficiency', 'safety'],
  },
  {
    name: 'Specialized Cargo Services',
    slug: 'specialized-cargo',
    description: 'Dangerous goods handling, bonded cargo, and specialized warehousing services.',
    pillarKeyword: 'bonded cargo handling Montreal',
    matchTerms: ['hazmat', 'dangerous', 'bonded', 'in-bond', 'specialized', 'consolidation', 'deconsolidation'],
  },
  {
    name: 'Supply Chain & Industry Trends',
    slug: 'supply-chain-trends',
    description: 'Industry trends, supply chain optimization, sustainability, and market analysis.',
    pillarKeyword: 'supply chain trends Canada 2026',
    matchTerms: ['supply chain', 'trend', 'sustainable', 'green', 'esg', 'forecast', 'growth', 'market'],
  },
];

function matchScore(article: NewsArticleSummary, matchTerms: string[]): number {
  const text = `${article.title} ${article.excerpt} ${article.category} ${article.tags.join(' ')}`.toLowerCase();
  return matchTerms.filter((term) => text.includes(term)).length;
}

export async function buildContentClusters(): Promise<ContentCluster[]> {
  const published = await listArticles({ status: 'published' });
  const clusters: ContentCluster[] = [];

  for (const def of CLUSTER_DEFINITIONS) {
    const matched = published
      .map((a) => ({ article: a, score: matchScore(a, def.matchTerms) }))
      .filter((m) => m.score >= 1)
      .sort((a, b) => b.score - a.score)
      .map((m) => m.article);

    clusters.push({
      name: def.name,
      slug: def.slug,
      description: def.description,
      pillarKeyword: def.pillarKeyword,
      articles: matched,
      articleCount: matched.length,
    });
  }

  return clusters.sort((a, b) => b.articleCount - a.articleCount);
}
