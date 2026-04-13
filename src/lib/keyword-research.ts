// Keyword research engine
// Discovers bottom-of-funnel long-tail keywords for warehousing/logistics
// Analyzes competitors, identifies content gaps, scores opportunities

import { getKeywordStorage, type KeywordEntry, type KeywordFilter } from './keyword-store';
import { fetchRealKeywordMetrics, isGoogleAdsApiAvailable } from './keyword-api';

// ==================== Intent Detection ====================

const TRANSACTIONAL_SIGNALS = [
  'cost', 'price', 'quote', 'hire', 'buy', 'rent', 'book', 'order',
  'near me', 'best', 'top', 'compare', 'vs', 'affordable', 'cheap',
  'service', 'provider', 'company', 'companies',
];

const COMMERCIAL_SIGNALS = [
  'review', 'guide', 'how to choose', 'comparison', 'alternative',
  'benefits', 'pros cons', 'worth it', 'should i', 'which',
];

const BOF_SIGNALS = [
  // Location-specific
  'montreal', 'quebec', 'canada', 'toronto', 'vancouver',
  // Service-specific
  'sufferance warehouse', 'bonded warehouse', 'customs', '3pl',
  'fulfillment', 'cross-dock', 'hazmat', 'consolidation',
  // Action-oriented
  'cost', 'pricing', 'quote', 'near me', 'hire', 'services',
  'requirements', 'regulations', 'compliance', 'how to',
  // Niche qualifiers
  'small business', 'e-commerce', 'import export',
  'dangerous goods', 'bonded cargo',
];

function detectIntent(keyword: string): KeywordEntry['intent'] {
  const lower = keyword.toLowerCase();
  if (TRANSACTIONAL_SIGNALS.some((s) => lower.includes(s))) return 'transactional';
  if (COMMERCIAL_SIGNALS.some((s) => lower.includes(s))) return 'commercial';
  return 'informational';
}

function detectFunnelPosition(keyword: string, intent: string): KeywordEntry['funnelPosition'] {
  const lower = keyword.toLowerCase();
  const bofScore = BOF_SIGNALS.filter((s) => lower.includes(s)).length;

  if (intent === 'transactional' || bofScore >= 3) return 'bottom';
  if (intent === 'commercial' || bofScore >= 1) return 'middle';
  return 'top';
}

// ==================== Opportunity Scoring ====================

function calculateOpportunity(
  searchVolume: number,
  difficulty: number,
  funnelPosition: string,
  intent: string,
  wordCount: number,
): number {
  // Base score from volume vs difficulty
  const volumeScore = Math.min(30, (searchVolume / 100) * 30);
  const difficultyBonus = ((100 - difficulty) / 100) * 25;

  // Funnel bonus: bottom > middle > top
  const funnelBonus = funnelPosition === 'bottom' ? 25 : funnelPosition === 'middle' ? 15 : 5;

  // Intent bonus: transactional > commercial > informational
  const intentBonus = intent === 'transactional' ? 15 : intent === 'commercial' ? 10 : 3;

  // Long-tail bonus: more words = less competition typically
  const longTailBonus = Math.min(5, Math.max(0, (wordCount - 3) * 1.5));

  return Math.min(100, Math.round(volumeScore + difficultyBonus + funnelBonus + intentBonus + longTailBonus));
}

// ==================== Keyword Discovery ====================

// Seed keywords + modifiers to generate long-tail combinations
const SEED_KEYWORDS = [
  'warehouse', 'warehousing', 'sufferance warehouse', 'bonded warehouse',
  'logistics', '3PL', 'fulfillment', 'distribution', 'freight forwarding',
  'customs clearance', 'customs broker', 'cargo consolidation',
  'cross-docking', 'inventory management', 'warehouse management',
  'import export', 'shipping', 'cargo handling', 'supply chain',
];

const LOCATION_MODIFIERS = [
  'Montreal', 'Quebec', 'Canada', 'Montreal area', 'Greater Montreal',
  'Eastern Canada', 'Port of Montreal',
];

const INTENT_MODIFIERS = [
  'cost', 'pricing', 'services', 'companies', 'providers', 'near me',
  'requirements', 'regulations', 'guide', 'how to', 'best practices',
  'benefits', 'vs', 'comparison', 'for small business', 'for e-commerce',
  'for import export', 'bonded cargo',
  'dangerous goods', 'hazmat', 'CBSA', 'CARM',
];

const YEAR_MODIFIERS = ['2026', '2027'];

const CATEGORY_MAP: Record<string, string> = {
  'customs': 'Customs & Regulations',
  'bonded': 'Customs & Regulations',
  'CBSA': 'Customs & Regulations',
  'CARM': 'Customs & Regulations',
  'clearance': 'Customs & Regulations',
  'import': 'Trade & Commerce',
  'export': 'Trade & Commerce',
  'freight': 'Trade & Commerce',
  'shipping': 'Trade & Commerce',
  'port': 'Trade & Commerce',
  'e-commerce': 'E-Commerce',
  'fulfillment': 'E-Commerce',
  'last mile': 'E-Commerce',
  'hazmat': 'Specialized Services',
  'dangerous': 'Specialized Services',
  'consolidation': 'Warehouse Operations',
  'automation': 'Technology',
  'WMS': 'Technology',
  'technology': 'Technology',
  'robotics': 'Technology',
  'inventory': 'Warehouse Operations',
  'cross-dock': 'Warehouse Operations',
  'safety': 'Warehouse Operations',
  'management': 'Warehouse Operations',
};

function detectCategory(keyword: string): string {
  const lower = keyword.toLowerCase();
  for (const [signal, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(signal.toLowerCase())) return category;
  }
  return 'Industry Trends';
}

// Estimate search volume based on keyword characteristics
// (In production, this would call SEMrush/Ahrefs API)
function estimateSearchVolume(keyword: string): number {
  const wordCount = keyword.split(' ').length;
  // Longer keywords = lower volume but higher intent
  const baseVolume = Math.max(10, 500 - (wordCount * 50));
  // Location keywords get a boost
  const locationBoost = LOCATION_MODIFIERS.some((l) => keyword.toLowerCase().includes(l.toLowerCase())) ? 1.3 : 1.0;
  // Year keywords get a freshness boost
  const yearBoost = YEAR_MODIFIERS.some((y) => keyword.includes(y)) ? 1.2 : 1.0;
  return Math.round(baseVolume * locationBoost * yearBoost * (0.7 + Math.random() * 0.6));
}

// Estimate difficulty based on keyword characteristics
function estimateDifficulty(keyword: string): number {
  const wordCount = keyword.split(' ').length;
  // More words = generally lower difficulty
  const baseDifficulty = Math.max(10, 70 - (wordCount * 8));
  // Branded/specific terms are harder
  const specificBoost = keyword.includes('Montreal') ? 5 : 0;
  return Math.min(95, Math.round(baseDifficulty + specificBoost + (Math.random() * 15 - 7)));
}

export async function discoverKeywords(options?: {
  maxKeywords?: number;
  focusCategories?: string[];
}): Promise<KeywordEntry[]> {
  const storage = getKeywordStorage();
  const maxNew = options?.maxKeywords || 50;
  const discovered: KeywordEntry[] = [];
  const existingKeywords = new Set(
    (await storage.list()).map((k) => k.keyword.toLowerCase()),
  );

  // Generate keyword combinations
  const combinations: string[] = [];

  for (const seed of SEED_KEYWORDS) {
    // Seed + location
    for (const location of LOCATION_MODIFIERS) {
      combinations.push(`${seed} ${location}`);
    }
    // Seed + intent modifier
    for (const intent of INTENT_MODIFIERS) {
      combinations.push(`${seed} ${intent}`);
    }
    // Seed + location + intent
    for (const location of LOCATION_MODIFIERS.slice(0, 3)) {
      for (const intent of INTENT_MODIFIERS.slice(0, 8)) {
        combinations.push(`${seed} ${location} ${intent}`);
      }
    }
    // Seed + year
    for (const year of YEAR_MODIFIERS) {
      combinations.push(`${seed} ${year}`);
    }
  }

  // Shuffle and deduplicate
  const shuffled = [...new Set(combinations)].sort(() => Math.random() - 0.5);

  // Pre-filter candidates so we can batch-query the API once
  const candidates = shuffled
    .filter((c) => c.toLowerCase().trim().split(' ').length >= 3)
    .filter((c) => !existingKeywords.has(c.toLowerCase().trim()))
    .slice(0, maxNew * 3); // take 3x because API returns 0 for some

  // If Google Ads API is configured, batch-fetch real metrics up front
  const useRealApi = isGoogleAdsApiAvailable();
  const realMetrics = useRealApi
    ? await fetchRealKeywordMetrics(candidates).catch((err) => {
        console.error('[discoverKeywords] Google Ads API failed, falling back to estimates:', err);
        return new Map();
      })
    : new Map();

  for (const combo of candidates) {
    if (discovered.length >= maxNew) break;

    const normalized = combo.toLowerCase().trim();
    if (existingKeywords.has(normalized)) continue;
    if (normalized.split(' ').length < 3) continue; // Skip short keywords

    // Prefer real API data; fall back to heuristic estimate
    const real = realMetrics.get(normalized);
    let searchVolume: number;
    let difficulty: number;
    if (real && real.volume > 0) {
      searchVolume = real.volume;
      difficulty = real.difficulty;
    } else if (useRealApi) {
      // API was used but returned no data for this keyword — skip it
      continue;
    } else {
      searchVolume = estimateSearchVolume(normalized);
      difficulty = estimateDifficulty(normalized);
    }
    const intent = detectIntent(normalized);
    const funnelPosition = detectFunnelPosition(normalized, intent);
    const category = detectCategory(normalized);
    const wordCount = normalized.split(' ').length;

    // Filter by focus categories if specified
    if (options?.focusCategories?.length && !options.focusCategories.includes(category)) {
      continue;
    }

    const opportunity = calculateOpportunity(searchVolume, difficulty, funnelPosition, intent, wordCount);

    const entry: KeywordEntry = {
      id: crypto.randomUUID(),
      keyword: combo.trim(),
      searchVolume,
      difficulty,
      funnelPosition,
      intent,
      opportunity,
      status: 'discovered',
      relatedNewsSlug: null,
      source: 'auto-discovery',
      category,
      tags: [
        funnelPosition,
        intent,
        category.toLowerCase().replace(/\s+/g, '-'),
        real ? 'real-data' : 'estimated',
      ],
      lastUsed: null,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    discovered.push(entry);
    existingKeywords.add(normalized);
  }

  // Sort by opportunity score, highest first
  discovered.sort((a, b) => b.opportunity - a.opportunity);

  // Save all discovered keywords
  for (const entry of discovered) {
    await storage.save(entry);
  }

  return discovered;
}

// ==================== Competitor Gap Analysis ====================

// Simulated competitor keyword analysis
// In production, this would scrape competitor sitemaps/blogs or use SEMrush API
const COMPETITOR_DOMAINS = [
  'www.yusen-logistics.com',
  'www.dbschenker.com',
  'www.kuehne-nagel.com',
  'www.expeditors.com',
];

export async function analyzeCompetitorGaps(): Promise<{
  gaps: string[];
  competitors: string[];
}> {
  // Topics competitors cover that we don't yet
  const commonCompetitorTopics = [
    'air freight warehousing Montreal',
    'ocean freight consolidation warehouse',
    'customs bonded warehouse CBSA requirements',
    'warehouse to door delivery Canada',
    'perishable goods warehousing regulations Canada',
    'free trade zone vs bonded warehouse Canada',
    'warehouse insurance requirements Quebec',
    'seasonal warehousing solutions Montreal',
    'overflow warehouse space Montreal',
    'warehouse workforce management Quebec',
    'sustainable packaging warehousing',
    'warehouse fire safety Quebec CNESST',
    'pharmaceutical warehouse GDP compliance Canada',
    'automotive parts warehousing Montreal',
    'retail distribution warehouse Montreal',
  ];

  const storage = getKeywordStorage();
  const existing = new Set((await storage.list()).map((k) => k.keyword.toLowerCase()));
  const gaps = commonCompetitorTopics.filter((t) => !existing.has(t.toLowerCase()));

  return { gaps, competitors: COMPETITOR_DOMAINS };
}

// ==================== Match Keyword to External Content ====================

/**
 * Match an existing library keyword against a piece of external content
 * (RSS article title + summary). Used so scraped/rewritten articles also
 * get bound to a real keyword rather than bypassing the keyword library.
 *
 * Returns the best match (marked as in-progress) or null if no sufficient match.
 */
export async function matchKeywordForNews(
  title: string,
  summary: string,
): Promise<KeywordEntry | null> {
  const storage = getKeywordStorage();
  // Only match against unused, high-potential keywords
  const pool = [
    ...(await storage.list({ status: 'discovered', minOpportunity: 40 })),
    ...(await storage.list({ status: 'approved' })),
  ];
  if (pool.length === 0) return null;

  const text = `${title} ${summary}`.toLowerCase();

  // Score each candidate: token hit-rate * 50 + opportunity * 0.5
  const scored = pool
    .map((k) => {
      const tokens = k.keyword.toLowerCase().split(/\s+/).filter((t) => t.length >= 3);
      if (tokens.length === 0) return { k, score: 0 };
      const hits = tokens.filter((t) => text.includes(t)).length;
      const hitRate = hits / tokens.length;
      // Require at least half the tokens to hit for a meaningful match
      if (hitRate < 0.5) return { k, score: 0 };
      return { k, score: hitRate * 50 + k.opportunity * 0.5 };
    })
    .filter((s) => s.score >= 35);

  if (scored.length === 0) return null;

  scored.sort((a, b) => b.score - a.score);
  const selected = scored[0].k;

  // Mark as in-progress to prevent re-use
  selected.status = 'in-progress';
  selected.lastUsed = new Date().toISOString();
  selected.usageCount++;
  selected.updatedAt = new Date().toISOString();
  await storage.save(selected);

  return selected;
}

// ==================== Pick Best Keyword for Content ====================

export async function pickNextKeyword(): Promise<KeywordEntry | null> {
  const storage = getKeywordStorage();

  // First try: approved keywords that haven't been used
  let candidates = await storage.list({ status: 'approved', funnelPosition: 'bottom' });
  if (candidates.length === 0) {
    candidates = await storage.list({ status: 'approved' });
  }

  // Second try: discovered keywords with high opportunity
  if (candidates.length === 0) {
    candidates = await storage.list({ status: 'discovered', minOpportunity: 50 });
  }

  // Third try: any discovered keyword
  if (candidates.length === 0) {
    candidates = await storage.list({ status: 'discovered' });
  }

  if (candidates.length === 0) return null;

  // Pick the highest opportunity keyword that was least recently used
  candidates.sort((a, b) => {
    // Priority: never used > used long ago > recently used
    if (!a.lastUsed && b.lastUsed) return -1;
    if (a.lastUsed && !b.lastUsed) return 1;
    // Then by opportunity score
    return b.opportunity - a.opportunity;
  });

  const selected = candidates[0];

  // Mark as in-progress
  selected.status = 'in-progress';
  selected.lastUsed = new Date().toISOString();
  selected.usageCount++;
  selected.updatedAt = new Date().toISOString();
  await storage.save(selected);

  return selected;
}

// Mark keyword as published (after article is created)
export async function markKeywordPublished(
  keywordId: string,
  newsSlug: string,
): Promise<void> {
  const storage = getKeywordStorage();
  const entry = await storage.get(keywordId);
  if (!entry) return;

  entry.status = 'published';
  entry.relatedNewsSlug = newsSlug;
  entry.updatedAt = new Date().toISOString();
  await storage.save(entry);
}

// ==================== Keyword Stats ====================

export async function getKeywordStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byFunnel: Record<string, number>;
  byCategory: Record<string, number>;
  avgOpportunity: number;
  topOpportunities: KeywordEntry[];
}> {
  const storage = getKeywordStorage();
  const all = await storage.list();

  const byStatus: Record<string, number> = {};
  const byFunnel: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let totalOpp = 0;

  for (const k of all) {
    byStatus[k.status] = (byStatus[k.status] || 0) + 1;
    byFunnel[k.funnelPosition] = (byFunnel[k.funnelPosition] || 0) + 1;
    byCategory[k.category] = (byCategory[k.category] || 0) + 1;
    totalOpp += k.opportunity;
  }

  return {
    total: all.length,
    byStatus,
    byFunnel,
    byCategory,
    avgOpportunity: all.length > 0 ? Math.round(totalOpp / all.length) : 0,
    topOpportunities: all.slice(0, 10),
  };
}
