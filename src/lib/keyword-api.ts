// Google Ads API client for real keyword metrics
// Replaces random-number estimation in keyword-research.ts with actual
// Google Keyword Planner data (search volume, competition, CPC).

import { GoogleAdsApi } from 'google-ads-api';
import { getKeywordStorage, type KeywordEntry } from './keyword-store';

export type KeywordMetrics = {
  volume: number;           // avg monthly searches
  difficulty: number;       // 0-100, from competition_index
  cpc: number;              // top of page bid (CAD)
  competition: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
};

// Geo target constants
// 2124 = Canada, 1002138 = Quebec, 1002139 = Ontario
const GEO_CANADA = 'geoTargetConstants/2124';

// Language constants
// 1000 = English
const LANGUAGE_EN = 'languageConstants/1000';

let _client: GoogleAdsApi | null = null;
let _customer: ReturnType<GoogleAdsApi['Customer']> | null = null;

function isConfigured(): boolean {
  return !!(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_ADS_CLIENT_ID &&
    process.env.GOOGLE_ADS_CLIENT_SECRET &&
    process.env.GOOGLE_ADS_REFRESH_TOKEN &&
    process.env.GOOGLE_ADS_CUSTOMER_ID
  );
}

function getCustomer() {
  if (_customer) return _customer;
  if (!isConfigured()) {
    throw new Error(
      'Google Ads API not configured. Missing env vars: ' +
        'GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, ' +
        'GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CUSTOMER_ID',
    );
  }
  _client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
  _customer = _client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, ''),
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    login_customer_id: (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID!).replace(/-/g, ''),
  });
  return _customer;
}

export function isGoogleAdsApiAvailable(): boolean {
  return isConfigured();
}

const COMPETITION_TO_DIFFICULTY: Record<string, number> = {
  LOW: 25,
  MEDIUM: 55,
  HIGH: 85,
  UNKNOWN: 50,
};

/**
 * Fetch real keyword metrics from Google Keyword Planner.
 * Batches in chunks of 100 (Google Ads API limit is much higher but smaller
 * batches are safer for timeouts).
 */
export async function fetchRealKeywordMetrics(
  keywords: string[],
): Promise<Map<string, KeywordMetrics>> {
  const map = new Map<string, KeywordMetrics>();
  if (keywords.length === 0) return map;

  const customer = getCustomer();
  const BATCH = 100;

  for (let i = 0; i < keywords.length; i += BATCH) {
    const batch = keywords.slice(i, i + BATCH);
    try {
      // @ts-ignore — google-ads-api types occasionally lag behind service shape
      const response = await customer.keywordPlanIdeas.generateKeywordHistoricalMetrics({
        customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, ''),
        keywords: batch,
        language: LANGUAGE_EN,
        geo_target_constants: [GEO_CANADA],
        keyword_plan_network: 'GOOGLE_SEARCH',
        include_adult_keywords: false,
      });

      const results = (response as any).results || (response as any) || [];
      for (const item of results) {
        const text = String(item.text || '').toLowerCase().trim();
        if (!text) continue;
        const m = item.keyword_metrics;
        if (!m) continue;

        const competition = (m.competition as string) || 'UNKNOWN';
        const difficulty =
          typeof m.competition_index === 'number' && m.competition_index > 0
            ? Math.round(m.competition_index)
            : COMPETITION_TO_DIFFICULTY[competition] ?? 50;

        const cpcMicros = Number(m.high_top_of_page_bid_micros || m.low_top_of_page_bid_micros || 0);
        const cpc = cpcMicros / 1_000_000;

        map.set(text, {
          volume: Number(m.avg_monthly_searches || 0),
          difficulty,
          cpc,
          competition: competition as KeywordMetrics['competition'],
        });
      }
    } catch (err) {
      // Log + continue on batch failure so one bad batch doesn't kill the whole run
      console.error(
        `[keyword-api] batch ${i / BATCH} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return map;
}

/**
 * Batch-refresh every keyword in the local store with real Google data.
 * Returns counts; keyword entries with real volume replace the random estimates.
 */
export async function refreshAllKeywordsWithRealData(options?: {
  /** If true, also update opportunity score using the stored formula */
  recalculateOpportunity?: boolean;
}): Promise<{ updated: number; skipped: number; total: number }> {
  const storage = getKeywordStorage();
  const all = await storage.list();
  const keywords = all.map((k) => k.keyword);

  const metrics = await fetchRealKeywordMetrics(keywords);

  let updated = 0;
  let skipped = 0;

  for (const entry of all) {
    const m = metrics.get(entry.keyword.toLowerCase().trim());
    if (!m || m.volume === 0) {
      skipped++;
      continue;
    }
    entry.searchVolume = m.volume;
    entry.difficulty = m.difficulty;

    if (options?.recalculateOpportunity) {
      entry.opportunity = recalcOpportunity(entry, m);
    }
    entry.updatedAt = new Date().toISOString();
    await storage.save(entry);
    updated++;
  }

  return { updated, skipped, total: all.length };
}

function recalcOpportunity(entry: KeywordEntry, m: KeywordMetrics): number {
  const volumeScore = Math.min(30, (m.volume / 100) * 30);
  const difficultyBonus = ((100 - m.difficulty) / 100) * 25;
  const funnelBonus =
    entry.funnelPosition === 'bottom' ? 25 : entry.funnelPosition === 'middle' ? 15 : 5;
  const intentBonus =
    entry.intent === 'transactional' ? 15 : entry.intent === 'commercial' ? 10 : 3;
  const wordCount = entry.keyword.split(' ').length;
  const longTailBonus = Math.min(5, Math.max(0, (wordCount - 3) * 1.5));
  return Math.min(
    100,
    Math.round(volumeScore + difficultyBonus + funnelBonus + intentBonus + longTailBonus),
  );
}
