// SEO monitoring system
// Tracks article performance, keyword rankings, and content health over time

import { listArticles, getArticle, type NewsArticleSummary } from './news';
import { getKeywordStorage, type KeywordEntry } from './keyword-store';
import { assessFreshness, type FreshnessReport } from './content-refresher';

// ==================== Performance Tracking ====================

export type ArticlePerformance = {
  slug: string;
  title: string;
  publishedAt: string;
  daysSincePublish: number;
  seoScore: number;
  freshnessScore: number;
  wordCount: number;
  hasTargetKeyword: boolean;
  internalLinkCount: number;
  moneyPageLinkCount: number;
  status: 'healthy' | 'needs-attention' | 'critical';
};

export type SeoHealthReport = {
  timestamp: string;
  overview: {
    totalArticles: number;
    publishedArticles: number;
    avgSeoScore: number;
    avgFreshnessScore: number;
    avgWordCount: number;
    articlesNeedingRefresh: number;
  };
  keywordCoverage: {
    totalKeywords: number;
    publishedKeywords: number;
    unusedKeywords: number;
    topFunnelCoverage: number;
    bottomFunnelCoverage: number;
  };
  contentHealth: {
    healthy: number;
    needsAttention: number;
    critical: number;
  };
  topIssues: string[];
  recommendations: string[];
  articles: ArticlePerformance[];
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export async function generateSeoHealthReport(): Promise<SeoHealthReport> {
  const allArticles = await listArticles();
  const published = allArticles.filter((a) => a.status === 'published');
  const kwStorage = getKeywordStorage();
  const allKeywords = await kwStorage.list();

  const articlePerformances: ArticlePerformance[] = [];
  let totalSeo = 0;
  let totalFreshness = 0;
  let totalWordCount = 0;
  let needsRefreshCount = 0;
  let healthyCount = 0;
  let attentionCount = 0;
  let criticalCount = 0;

  for (const summary of published) {
    const full = await getArticle(summary.slug);
    if (!full) continue;

    const freshness = await assessFreshness(full);
    const moneyLinks = full.internalLinks.filter((l) => l.type === 'money-page').length;
    const daysPublished = full.publishedAt ? daysSince(full.publishedAt) : 0;

    let status: ArticlePerformance['status'] = 'healthy';
    if (freshness.freshnessScore < 30 || full.wordCount < 300 || moneyLinks === 0) {
      status = 'critical';
      criticalCount++;
    } else if (freshness.freshnessScore < 60 || daysPublished > 60) {
      status = 'needs-attention';
      attentionCount++;
    } else {
      healthyCount++;
    }

    if (freshness.priority !== 'low') needsRefreshCount++;

    const perf: ArticlePerformance = {
      slug: full.slug,
      title: full.title,
      publishedAt: full.publishedAt || full.createdAt,
      daysSincePublish: daysPublished,
      seoScore: freshness.seoScore,
      freshnessScore: freshness.freshnessScore,
      wordCount: full.wordCount,
      hasTargetKeyword: !!full.targetKeyword,
      internalLinkCount: full.internalLinks.length,
      moneyPageLinkCount: moneyLinks,
      status,
    };

    articlePerformances.push(perf);
    totalSeo += freshness.seoScore;
    totalFreshness += freshness.freshnessScore;
    totalWordCount += full.wordCount;
  }

  const count = published.length || 1;

  // Keyword coverage
  const publishedKw = allKeywords.filter((k) => k.status === 'published');
  const unusedKw = allKeywords.filter((k) => k.status === 'discovered' || k.status === 'approved');
  const bofKw = allKeywords.filter((k) => k.funnelPosition === 'bottom');
  const tofKw = allKeywords.filter((k) => k.funnelPosition === 'top');
  const bofPublished = bofKw.filter((k) => k.status === 'published');
  const tofPublished = tofKw.filter((k) => k.status === 'published');

  // Generate recommendations
  const recommendations: string[] = [];
  const topIssues: string[] = [];

  if (published.length < 10) {
    recommendations.push(`Publish more articles. Currently at ${published.length} — aim for 30+ for meaningful SEO impact.`);
  }
  if (totalSeo / count < 60) {
    topIssues.push(`Average SEO score is low (${Math.round(totalSeo / count)}). Review meta descriptions, headings, and keyword density.`);
  }
  if (needsRefreshCount > 0) {
    topIssues.push(`${needsRefreshCount} article(s) need content refresh.`);
    recommendations.push('Run POST /api/news/refresh to update stale content.');
  }
  if (unusedKw.length > 20) {
    recommendations.push(`${unusedKw.length} keywords discovered but unused. Approve high-opportunity keywords for content generation.`);
  }
  if (bofKw.length > 0 && bofPublished.length / bofKw.length < 0.3) {
    recommendations.push(`Only ${Math.round((bofPublished.length / bofKw.length) * 100)}% of bottom-of-funnel keywords have published content. Prioritize BOF keywords for higher conversion.`);
  }
  if (criticalCount > 0) {
    topIssues.push(`${criticalCount} article(s) in critical condition — low freshness, thin content, or missing internal links.`);
  }

  const avgWordCount = Math.round(totalWordCount / count);
  if (avgWordCount < 600) {
    recommendations.push(`Average word count is ${avgWordCount}. Aim for 800+ words per article for better SEO rankings.`);
  }

  // Sort articles: critical first, then needs-attention, then healthy
  articlePerformances.sort((a, b) => {
    const order = { critical: 0, 'needs-attention': 1, healthy: 2 };
    return order[a.status] - order[b.status];
  });

  return {
    timestamp: new Date().toISOString(),
    overview: {
      totalArticles: allArticles.length,
      publishedArticles: published.length,
      avgSeoScore: Math.round(totalSeo / count),
      avgFreshnessScore: Math.round(totalFreshness / count),
      avgWordCount,
      articlesNeedingRefresh: needsRefreshCount,
    },
    keywordCoverage: {
      totalKeywords: allKeywords.length,
      publishedKeywords: publishedKw.length,
      unusedKeywords: unusedKw.length,
      topFunnelCoverage: tofKw.length > 0 ? Math.round((tofPublished.length / tofKw.length) * 100) : 0,
      bottomFunnelCoverage: bofKw.length > 0 ? Math.round((bofPublished.length / bofKw.length) * 100) : 0,
    },
    contentHealth: {
      healthy: healthyCount,
      needsAttention: attentionCount,
      critical: criticalCount,
    },
    topIssues,
    recommendations,
    articles: articlePerformances,
  };
}
