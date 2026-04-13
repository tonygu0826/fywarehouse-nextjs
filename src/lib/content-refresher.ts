// Content refresh system
// Identifies stale articles and refreshes them to maintain SEO performance

import { listArticles, getArticle, updateArticle, type NewsArticle, type NewsArticleSummary } from './news';
import { calculateSeoScore, ensureInternalLinks } from './seo-optimizer';

// ==================== Freshness Scoring ====================

export type FreshnessReport = {
  slug: string;
  title: string;
  freshnessScore: number;   // 0-100, higher = fresher
  seoScore: number;
  daysSinceUpdate: number;
  issues: string[];
  priority: 'high' | 'medium' | 'low';
};

function daysBetween(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export async function assessFreshness(article: NewsArticle): Promise<FreshnessReport> {
  const daysSinceUpdate = daysBetween(article.updatedAt);
  const daysSincePublish = article.publishedAt ? daysBetween(article.publishedAt) : daysSinceUpdate;
  const issues: string[] = [];

  // Time decay: articles lose freshness over time
  let timeScore = 100;
  if (daysSinceUpdate > 7) timeScore -= 10;
  if (daysSinceUpdate > 30) timeScore -= 20;
  if (daysSinceUpdate > 60) timeScore -= 20;
  if (daysSinceUpdate > 90) timeScore -= 20;
  if (daysSinceUpdate > 180) timeScore -= 30;
  timeScore = Math.max(0, timeScore);

  // Content quality checks
  const contentLower = article.content.toLowerCase();

  // Check for outdated year references
  const currentYear = new Date().getFullYear();
  const yearPatterns = [2022, 2023, 2024, 2025].filter((y) => y < currentYear);
  for (const year of yearPatterns) {
    if (contentLower.includes(String(year))) {
      issues.push(`Contains outdated year reference: ${year}`);
      timeScore -= 10;
    }
  }

  // Check word count (thin content)
  if (article.wordCount < 300) {
    issues.push(`Thin content: only ${article.wordCount} words (minimum 300)`);
    timeScore -= 15;
  }

  // Check internal links
  const moneyPageLinks = article.internalLinks.filter((l) => l.type === 'money-page');
  if (moneyPageLinks.length < 2) {
    issues.push(`Only ${moneyPageLinks.length} money page link(s) (need 2+)`);
    timeScore -= 10;
  }

  // Check for broken structure
  const h2Count = (article.content.match(/<h2/gi) || []).length;
  if (h2Count < 2) {
    issues.push(`Only ${h2Count} H2 heading(s) (need 2+)`);
    timeScore -= 5;
  }

  // SEO score
  const seoReport = calculateSeoScore(
    article.content,
    article.title,
    article.metaDescription,
    article.targetKeyword,
    article.internalLinks,
  );

  const freshnessScore = Math.max(0, Math.min(100, Math.round(
    (timeScore * 0.5) + (seoReport.score * 0.5),
  )));

  // Determine priority
  let priority: 'high' | 'medium' | 'low' = 'low';
  if (freshnessScore < 30 || daysSinceUpdate > 90) priority = 'high';
  else if (freshnessScore < 60 || daysSinceUpdate > 45) priority = 'medium';

  if (daysSinceUpdate > 30) issues.push(`Not updated in ${daysSinceUpdate} days`);

  return {
    slug: article.slug,
    title: article.title,
    freshnessScore,
    seoScore: seoReport.score,
    daysSinceUpdate,
    issues,
    priority,
  };
}

// ==================== Content Audit ====================

export async function auditAllContent(): Promise<{
  total: number;
  needsRefresh: FreshnessReport[];
  healthy: number;
  avgFreshness: number;
}> {
  const articles = await listArticles({ status: 'published' });
  const reports: FreshnessReport[] = [];
  let totalFreshness = 0;

  for (const summary of articles) {
    const full = await getArticle(summary.slug);
    if (!full) continue;
    const report = await assessFreshness(full);
    reports.push(report);
    totalFreshness += report.freshnessScore;
  }

  const needsRefresh = reports
    .filter((r) => r.priority === 'high' || r.priority === 'medium')
    .sort((a, b) => a.freshnessScore - b.freshnessScore);

  return {
    total: reports.length,
    needsRefresh,
    healthy: reports.filter((r) => r.priority === 'low').length,
    avgFreshness: reports.length > 0 ? Math.round(totalFreshness / reports.length) : 0,
  };
}

// ==================== Auto-Refresh ====================

export type RefreshResult = {
  slug: string;
  title: string;
  changes: string[];
  newSeoScore: number;
};

export async function refreshArticle(slug: string): Promise<RefreshResult> {
  const article = await getArticle(slug);
  if (!article) throw new Error('Article not found.');

  const changes: string[] = [];
  let updatedContent = article.content;
  let updatedMeta = article.metaDescription;
  const updatedLinks = [...article.internalLinks];
  const currentYear = new Date().getFullYear();

  // 1. Update outdated year references
  const oldYears = [2022, 2023, 2024, 2025].filter((y) => y < currentYear);
  for (const oldYear of oldYears) {
    if (updatedContent.includes(String(oldYear))) {
      updatedContent = updatedContent.replace(
        new RegExp(String(oldYear), 'g'),
        String(currentYear),
      );
      changes.push(`Updated year references: ${oldYear} → ${currentYear}`);
    }
    if (updatedMeta.includes(String(oldYear))) {
      updatedMeta = updatedMeta.replace(
        new RegExp(String(oldYear), 'g'),
        String(currentYear),
      );
    }
  }

  // 2. Ensure internal links are present
  const { content: linkedContent, links: newLinks } = ensureInternalLinks(
    updatedContent,
    updatedLinks,
    2,
  );
  if (newLinks.length > updatedLinks.length) {
    updatedContent = linkedContent;
    changes.push(`Added ${newLinks.length - updatedLinks.length} internal link(s)`);
  }

  // 3. Add freshness signal - update date reference
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (!updatedContent.includes(`Updated ${dateStr}`)) {
    // Add an "Updated" note at the beginning
    const updateNote = `<p><em>Updated ${dateStr}</em></p>\n`;
    if (updatedContent.startsWith('<p><em>Updated')) {
      // Replace existing update note
      updatedContent = updatedContent.replace(/^<p><em>Updated [^<]+<\/em><\/p>\n?/, updateNote);
      changes.push('Updated freshness date stamp');
    } else {
      updatedContent = updateNote + updatedContent;
      changes.push('Added freshness date stamp');
    }
  }

  // 4. Improve meta description if too short/long
  if (updatedMeta.length < 100 || updatedMeta.length > 165) {
    const textContent = updatedContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    updatedMeta = textContent.slice(0, 155).replace(/\s\S*$/, '') + '...';
    changes.push('Optimized meta description length');
  }

  // Apply updates
  if (changes.length > 0) {
    await updateArticle(slug, {
      content: updatedContent,
      metaDescription: updatedMeta,
      internalLinks: newLinks,
    });
  }

  // Calculate new SEO score
  const seoReport = calculateSeoScore(
    updatedContent,
    article.title,
    updatedMeta,
    article.targetKeyword,
    newLinks,
  );

  return {
    slug,
    title: article.title,
    changes,
    newSeoScore: seoReport.score,
  };
}

// Batch refresh: refresh all articles that need it
export async function batchRefresh(maxArticles = 5): Promise<RefreshResult[]> {
  const audit = await auditAllContent();
  const toRefresh = audit.needsRefresh.slice(0, maxArticles);
  const results: RefreshResult[] = [];

  for (const report of toRefresh) {
    try {
      const result = await refreshArticle(report.slug);
      results.push(result);
    } catch (error) {
      results.push({
        slug: report.slug,
        title: report.title,
        changes: [`Error: ${error instanceof Error ? error.message : 'Unknown'}`],
        newSeoScore: 0,
      });
    }
  }

  return results;
}
