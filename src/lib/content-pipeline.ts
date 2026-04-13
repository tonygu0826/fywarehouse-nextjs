// Content generation pipeline
// Orchestrates: scrape -> generate -> optimize -> save

import { fetchAllNews, filterRelevantNews, type NewsSource, DEFAULT_NEWS_SOURCES } from './news-scraper';
import { generateArticleFromNews, generateOriginalArticle, getRandomTopic } from './news-generator';
import { generateArticleWithAI, rewriteNewsWithAI, isAIAvailable } from './ai-content-generator';
import { calculateSeoScore, ensureInternalLinks } from './seo-optimizer';
import { createArticle, publishArticle, listArticles, type NewsArticle, type NewsArticleSummary } from './news';
import { getNewsStorage } from './news-store';
import { pickNextKeyword, markKeywordPublished, matchKeywordForNews } from './keyword-research';
import { scheduleNewsToSocial } from './social-scheduler';
import { interlinkNewArticle } from './interlinking';
import { indexNewArticle } from './google-indexing';
import { publishArticleToGbp } from './gbp-poster';

export type PipelineConfig = {
  dailyCount: number;           // Target articles per run (default: 3)
  sources: NewsSource[];        // RSS sources
  autoPublish: boolean;         // Publish immediately or save as draft
  mixRatio: number;             // 0-1, ratio of scraped vs original (0.6 = 60% scraped)
};

export type PipelineResult = {
  generated: number;
  published: number;
  socialScheduled: number;
  errors: string[];
  articles: Array<{ slug: string; title: string; source: string }>;
};

const DEFAULT_CONFIG: PipelineConfig = {
  dailyCount: 3,
  sources: DEFAULT_NEWS_SOURCES,
  autoPublish: false,
  mixRatio: 0.6,
};

export async function runContentPipeline(
  config: Partial<PipelineConfig> = {},
): Promise<PipelineResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const result: PipelineResult = {
    generated: 0,
    published: 0,
    socialScheduled: 0,
    errors: [],
    articles: [],
  };

  // Collect published articles for social scheduling
  const publishedArticles: NewsArticleSummary[] = [];

  const targetScraped = Math.ceil(cfg.dailyCount * cfg.mixRatio);
  let actualScraped = 0;

  // Phase 1: Generate articles from scraped news
  if (targetScraped > 0) {
    try {
      const allNews = await fetchAllNews(cfg.sources, 5);
      const relevant = filterRelevantNews(allNews);

      // Pre-filter: skip source URLs already used in existing articles
      const existingArticles = await listArticles();
      const store = getNewsStorage();
      const usedSourceUrls = new Set<string>();
      for (const a of existingArticles) {
        const full = await store.getArticle(a.slug);
        if (full?.sourceUrl) usedSourceUrls.add(full.sourceUrl);
      }
      const fresh = relevant.filter((n) => !usedSourceUrls.has(n.link));
      const toProcess = fresh.slice(0, targetScraped);

      const useAI = isAIAvailable();

      for (const news of toProcess) {
        try {
          // Bind this article to a real keyword from the library.
          // First try to match existing discovered/approved keywords to
          // the news content; fall back to picking the next best keyword.
          const matchedKw =
            (await matchKeywordForNews(news.title, news.description).catch(() => null)) ||
            (await pickNextKeyword().catch(() => null));

          // Use Claude AI if available, fallback to template
          const generated = useAI
            ? await rewriteNewsWithAI(news, matchedKw?.keyword)
            : await generateArticleFromNews(news);
          const { content, links } = ensureInternalLinks(
            generated.content,
            generated.internalLinks,
          );

          const seoReport = calculateSeoScore(
            content,
            generated.title,
            generated.metaDescription,
            generated.targetKeyword,
            links,
          );

          const article = await createArticle({
            ...generated,
            content,
            internalLinks: links,
            status: cfg.autoPublish ? 'published' : 'draft',
          });

          if (cfg.autoPublish && article.status === 'draft') {
            await publishArticle(article.slug);
            result.published++;
          } else if (article.status === 'published') {
            result.published++;
          }

          // Mark keyword as published if we bound one
          if (matchedKw) {
            await markKeywordPublished(matchedKw.id, article.slug).catch(() => {});
          }

          if (article.status === 'published') {
            publishedArticles.push(article);
          }

          result.generated++;
          result.articles.push({
            slug: article.slug,
            title: article.title,
            source: matchedKw
              ? `scraped+kw:${news.source}|${matchedKw.keyword}`
              : `scraped:${news.source}`,
          });
        } catch (error) {
          result.errors.push(
            `Failed to process scraped news "${news.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    } catch (error) {
      result.errors.push(
        `Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  actualScraped = result.generated;
  // Fill remaining slots with original articles (including any scraped slots that failed/had no fresh content)
  const originalCount = cfg.dailyCount - actualScraped;

  // Phase 2: Generate original articles from keyword library
  for (let i = 0; i < originalCount; i++) {
    try {
      // Try to pick from keyword library first, fallback to random topic
      const kwEntry = await pickNextKeyword();
      const topic = kwEntry
        ? { keyword: kwEntry.keyword, category: kwEntry.category }
        : getRandomTopic();

      // Use Claude AI if available, fallback to template
      const generated = isAIAvailable()
        ? await generateArticleWithAI(topic.keyword, topic.category)
        : await generateOriginalArticle(topic.keyword, topic.category);
      const { content, links } = ensureInternalLinks(
        generated.content,
        generated.internalLinks,
      );

      const article = await createArticle({
        ...generated,
        content,
        internalLinks: links,
        status: cfg.autoPublish ? 'published' : 'draft',
      });

      if (cfg.autoPublish && article.status === 'draft') {
        await publishArticle(article.slug);
        result.published++;
      } else if (article.status === 'published') {
        result.published++;
      }

      // Mark keyword as published if from library
      if (kwEntry) {
        await markKeywordPublished(kwEntry.id, article.slug);
      }

      if (article.status === 'published') {
        publishedArticles.push(article);
      }

      result.generated++;
      result.articles.push({
        slug: article.slug,
        title: article.title,
        source: kwEntry ? `keyword:${kwEntry.keyword}` : `original:${topic.keyword}`,
      });
    } catch (error) {
      result.errors.push(
        `Failed to generate original article: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Phase 3: Auto-interlink and social schedule published articles
  for (const article of publishedArticles) {
    // Notify Google Indexing API
    try {
      await indexNewArticle(article.slug);
    } catch { /* non-critical */ }

    // Interlink with related articles
    try {
      await interlinkNewArticle(article.slug);
    } catch (error) {
      result.errors.push(
        `Interlinking failed for "${article.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Schedule to social media
    try {
      const socialResult = await scheduleNewsToSocial(article);
      if (socialResult) {
        result.socialScheduled++;
      }
    } catch (error) {
      result.errors.push(
        `Social scheduling failed for "${article.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Publish to Google Business Profile
    try {
      await publishArticleToGbp(article);
    } catch { /* non-critical — GBP posting is best-effort */ }
  }

  return result;
}
