// Comprehensive SEO monitoring dashboard
// Integrates seo-monitoring.ts, keyword-store.ts, and GSC data
// into a unified health report with scoring

import { generateSeoHealthReport, type SeoHealthReport } from './seo-monitoring';
import { getKeywordStorage, type KeywordEntry } from './keyword-store';
import {
  getDailyTraffic,
  getTopQueries,
  getTopPages,
  type DailyTraffic,
  type TopQuery,
  type TopPage,
} from './gsc-client';
import * as fs from 'fs';
import * as path from 'path';

// ==================== Types ====================

export type IndexingMetrics = {
  totalIndexedPages: number;
  newPagesLast7Days: number;
  avgIndexingSpeedDays: number; // average days for new page to appear in GSC
  crawlErrors: number;
};

export type KeywordRankingChange = {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  change: number; // positive = improved (moved up)
  clicks: number;
  impressions: number;
};

export type CtrTrend = {
  date: string;
  ctr: number;
  clicks: number;
  impressions: number;
};

export type DashboardReport = {
  generated_at: string;
  overall_score: number; // 0-100
  indexed_pages: IndexingMetrics;
  top_keywords: KeywordRankingChange[];
  ctr_trends: CtrTrend[];
  crawl_errors: string[];
  recommendations: string[];
  content_health: SeoHealthReport['contentHealth'];
  keyword_coverage: SeoHealthReport['keywordCoverage'];
  traffic_summary: {
    total_clicks: number;
    total_impressions: number;
    avg_ctr: number;
    avg_position: number;
    period_days: number;
  };
  top_pages: TopPage[];
};

// ==================== Snapshot Storage ====================

const SNAPSHOT_DIR = path.join(process.cwd(), 'data', 'seo', 'snapshots');

function ensureSnapshotDir(): void {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

function getSnapshotPath(date: string): string {
  return path.join(SNAPSHOT_DIR, `ranking-${date}.json`);
}

type RankingSnapshot = {
  date: string;
  keywords: Array<{ keyword: string; position: number; clicks: number; impressions: number }>;
};

function saveRankingSnapshot(snapshot: RankingSnapshot): void {
  ensureSnapshotDir();
  fs.writeFileSync(getSnapshotPath(snapshot.date), JSON.stringify(snapshot, null, 2));
}

function loadRankingSnapshot(date: string): RankingSnapshot | null {
  try {
    const filePath = getSnapshotPath(date);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function getPreviousSnapshotDate(daysAgo = 7): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// ==================== Metric Collection ====================

async function collectIndexingMetrics(): Promise<IndexingMetrics> {
  try {
    const topPages = await getTopPages(1000, 28);
    const recentPages = await getTopPages(1000, 7);

    return {
      totalIndexedPages: topPages.length,
      newPagesLast7Days: Math.max(0, recentPages.length - topPages.length + recentPages.length),
      avgIndexingSpeedDays: 3, // GSC data typically has 3-day delay; refine with real data
      crawlErrors: 0, // Would need GSC URL Inspection API for real data
    };
  } catch {
    return {
      totalIndexedPages: 0,
      newPagesLast7Days: 0,
      avgIndexingSpeedDays: 0,
      crawlErrors: 0,
    };
  }
}

async function collectKeywordRankingChanges(): Promise<KeywordRankingChange[]> {
  try {
    const currentQueries = await getTopQueries(50, 7);
    const today = new Date().toISOString().split('T')[0];

    // Save current snapshot
    saveRankingSnapshot({
      date: today,
      keywords: currentQueries.map((q) => ({
        keyword: q.query,
        position: q.position,
        clicks: q.clicks,
        impressions: q.impressions,
      })),
    });

    // Compare with previous snapshot
    const previousDate = getPreviousSnapshotDate(7);
    const previousSnapshot = loadRankingSnapshot(previousDate);

    return currentQueries.map((q) => {
      const prev = previousSnapshot?.keywords.find((k) => k.keyword === q.query);
      const previousPosition = prev?.position || q.position;
      return {
        keyword: q.query,
        currentPosition: q.position,
        previousPosition,
        change: Math.round((previousPosition - q.position) * 10) / 10,
        clicks: q.clicks,
        impressions: q.impressions,
      };
    });
  } catch {
    return [];
  }
}

async function collectCtrTrends(): Promise<CtrTrend[]> {
  try {
    const daily = await getDailyTraffic(28);
    return daily.map((d) => ({
      date: d.date,
      ctr: d.ctr,
      clicks: d.clicks,
      impressions: d.impressions,
    }));
  } catch {
    return [];
  }
}

// ==================== Score Calculation ====================

function calculateOverallScore(
  healthReport: SeoHealthReport,
  indexing: IndexingMetrics,
  rankings: KeywordRankingChange[],
  ctrTrends: CtrTrend[],
): number {
  let score = 50; // Base score

  // Content health (+/- 20 points)
  const totalContent = healthReport.contentHealth.healthy +
    healthReport.contentHealth.needsAttention +
    healthReport.contentHealth.critical;
  if (totalContent > 0) {
    const healthRatio = healthReport.contentHealth.healthy / totalContent;
    score += Math.round(healthRatio * 20 - 10);
  }

  // SEO score average (+/- 10 points)
  const avgSeo = healthReport.overview.avgSeoScore;
  if (avgSeo >= 70) score += 10;
  else if (avgSeo >= 50) score += 5;
  else if (avgSeo < 30) score -= 10;

  // Keyword coverage (+/- 10 points)
  if (healthReport.keywordCoverage.publishedKeywords > 20) score += 5;
  if (healthReport.keywordCoverage.bottomFunnelCoverage > 50) score += 5;

  // Indexing (+/- 10 points)
  if (indexing.totalIndexedPages > 50) score += 5;
  if (indexing.newPagesLast7Days > 0) score += 5;

  // Ranking improvements (+/- 10 points)
  const improvingKeywords = rankings.filter((r) => r.change > 0).length;
  const decliningKeywords = rankings.filter((r) => r.change < -1).length;
  score += Math.min(5, improvingKeywords);
  score -= Math.min(5, decliningKeywords);

  // CTR trend (+/- 10 points)
  if (ctrTrends.length >= 14) {
    const firstHalf = ctrTrends.slice(0, 14);
    const secondHalf = ctrTrends.slice(14);
    const avgFirst = firstHalf.reduce((s, c) => s + c.ctr, 0) / firstHalf.length;
    const avgSecond = secondHalf.length > 0
      ? secondHalf.reduce((s, c) => s + c.ctr, 0) / secondHalf.length
      : avgFirst;
    if (avgSecond > avgFirst) score += 5;
    else if (avgSecond < avgFirst * 0.8) score -= 5;
  }

  // Article count bonus
  if (healthReport.overview.publishedArticles >= 30) score += 5;
  else if (healthReport.overview.publishedArticles < 10) score -= 5;

  return Math.max(0, Math.min(100, score));
}

// ==================== Main Dashboard ====================

export async function generateDashboardReport(): Promise<DashboardReport> {
  // Collect all data in parallel
  const [healthReport, indexing, rankings, ctrTrends] = await Promise.all([
    generateSeoHealthReport(),
    collectIndexingMetrics(),
    collectKeywordRankingChanges(),
    collectCtrTrends(),
  ]);

  // Get top pages
  let topPages: TopPage[] = [];
  try {
    topPages = await getTopPages(10, 28);
  } catch { /* GSC not available */ }

  // Calculate traffic summary from CTR trends
  const totalClicks = ctrTrends.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = ctrTrends.reduce((s, c) => s + c.impressions, 0);
  const avgCtr = ctrTrends.length > 0
    ? Math.round(ctrTrends.reduce((s, c) => s + c.ctr, 0) / ctrTrends.length * 100) / 100
    : 0;

  // Build recommendations combining health report and new insights
  const recommendations = [...healthReport.recommendations];

  // Add ranking-based recommendations
  const topDecliners = rankings
    .filter((r) => r.change < -2)
    .sort((a, b) => a.change - b.change)
    .slice(0, 3);
  if (topDecliners.length > 0) {
    recommendations.push(
      `Keywords losing rankings: ${topDecliners.map((k) => `"${k.keyword}" (${k.change > 0 ? '+' : ''}${k.change})`).join(', ')}. Consider updating related content.`,
    );
  }

  if (indexing.totalIndexedPages === 0 && healthReport.overview.publishedArticles > 0) {
    recommendations.push('No pages detected in GSC. Verify Google Search Console access and sitemap submission.');
  }

  // Crawl errors from health report issues
  const crawlErrors = healthReport.topIssues;

  const overallScore = calculateOverallScore(healthReport, indexing, rankings, ctrTrends);

  return {
    generated_at: new Date().toISOString(),
    overall_score: overallScore,
    indexed_pages: indexing,
    top_keywords: rankings.slice(0, 20),
    ctr_trends: ctrTrends,
    crawl_errors: crawlErrors,
    recommendations,
    content_health: healthReport.contentHealth,
    keyword_coverage: healthReport.keywordCoverage,
    traffic_summary: {
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      avg_ctr: avgCtr,
      avg_position: topPages.length > 0
        ? Math.round(topPages.reduce((s, p) => s + p.position, 0) / topPages.length * 10) / 10
        : 0,
      period_days: ctrTrends.length,
    },
    top_pages: topPages,
  };
}
