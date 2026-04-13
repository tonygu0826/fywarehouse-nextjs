// Edge Runtime compatible news scraper
// Fetches from industry RSS feeds and extracts key information

export type ScrapedNews = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
};

export type NewsSource = {
  name: string;
  feedUrl: string;
  category: string;
};

// Default industry news sources for warehousing/logistics
// Multiple sources with fallbacks to ensure daily content availability
export const DEFAULT_NEWS_SOURCES: NewsSource[] = [
  {
    name: 'Supply Chain Dive',
    feedUrl: 'https://www.supplychaindive.com/feeds/news/',
    category: 'Supply Chain',
  },
  {
    name: 'FreightWaves',
    feedUrl: 'https://www.freightwaves.com/news/feed',
    category: 'Freight & Logistics',
  },
  {
    name: 'The Loadstar',
    feedUrl: 'https://theloadstar.com/feed/',
    category: 'Freight & Logistics',
  },
  {
    name: 'Logistics Manager',
    feedUrl: 'https://www.logisticsmanager.com/feed/',
    category: 'Logistics',
  },
  {
    name: 'Canadian Shipper',
    feedUrl: 'https://www.canadianshipper.com/feed/',
    category: 'Canada Logistics',
  },
  {
    name: 'DC Velocity',
    feedUrl: 'https://www.dcvelocity.com/rss/',
    category: 'Warehouse Operations',
  },
  {
    name: 'Supply Chain Management Review',
    feedUrl: 'https://www.scmr.com/rss',
    category: 'Supply Chain',
  },
  {
    name: 'Material Handling & Logistics',
    feedUrl: 'https://www.mhlnews.com/rss',
    category: 'Warehouse Operations',
  },
  {
    name: 'Journal of Commerce',
    feedUrl: 'https://www.joc.com/rss/news',
    category: 'Freight & Logistics',
  },
  {
    name: 'Inbound Logistics',
    feedUrl: 'https://www.inboundlogistics.com/articles/feed/',
    category: 'Logistics',
  },
  {
    name: 'Logistics Viewpoints',
    feedUrl: 'https://logisticsviewpoints.com/feed/',
    category: 'Logistics',
  },
  {
    name: 'Air Cargo News',
    feedUrl: 'https://www.aircargonews.net/feed/',
    category: 'Freight & Logistics',
  },
];

function extractTextFromXml(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  return match[1]
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function parseRssItems(xml: string): Array<{ title: string; description: string; link: string; pubDate: string }> {
  const items: Array<{ title: string; description: string; link: string; pubDate: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractTextFromXml(itemXml, 'title'),
      description: extractTextFromXml(itemXml, 'description'),
      link: extractTextFromXml(itemXml, 'link'),
      pubDate: extractTextFromXml(itemXml, 'pubDate'),
    });
  }

  return items;
}

async function fetchWithRetry(url: string, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'FYWarehouse-NewsBot/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown fetch error');
    }
    // Brief delay before retry (1s, 2s)
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  throw lastError || new Error('Fetch failed');
}

export async function fetchNewsFromSource(source: NewsSource, limit = 5): Promise<ScrapedNews[]> {
  try {
    const response = await fetchWithRetry(source.feedUrl);
    const xml = await response.text();
    const items = parseRssItems(xml);

    return items.slice(0, limit).map((item) => ({
      title: item.title,
      description: item.description.slice(0, 500),
      link: item.link,
      pubDate: item.pubDate || new Date().toISOString(),
      source: source.name,
    }));
  } catch (error) {
    console.error(`Error fetching ${source.name} after retries:`, error);
    return [];
  }
}

export async function fetchAllNews(
  sources: NewsSource[] = DEFAULT_NEWS_SOURCES,
  limitPerSource = 3,
): Promise<ScrapedNews[]> {
  const results = await Promise.allSettled(
    sources.map((source) => fetchNewsFromSource(source, limitPerSource)),
  );

  const allNews: ScrapedNews[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  }

  // Sort by date, newest first
  allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return allNews;
}

// Filter news relevant to warehousing/logistics keywords
const RELEVANCE_KEYWORDS = [
  'warehouse', 'warehousing', 'logistics', 'supply chain', 'freight',
  'customs', 'cargo', 'shipping', 'distribution', 'fulfillment',
  'inventory', 'transport', 'import', 'export', 'bonded',
  'canada', 'montreal', 'quebec', 'port', 'container',
  'e-commerce', 'last mile', '3pl', 'cross-dock', 'consolidation',
  'tariff', 'trade', 'border', 'cbsa', 'carrier', 'drayage',
  'intermodal', 'storage', 'pallets', 'forklift', 'automation',
  'air cargo', 'ocean freight', 'trucking', 'rail', 'broker',
];

export function filterRelevantNews(news: ScrapedNews[]): ScrapedNews[] {
  return news.filter((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    return RELEVANCE_KEYWORDS.some((keyword) => text.includes(keyword));
  });
}
