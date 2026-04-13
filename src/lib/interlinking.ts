// Automatic article interlinking system
// When a new article is published, cross-link with related existing articles

import { listArticles, getArticle, updateArticle, type NewsArticle, type NewsArticleSummary } from './news';
import type { InternalLink } from './news-store';

const MAX_INTERLINKS_PER_ARTICLE = 3; // max related article links to add
const MIN_RELEVANCE_SCORE = 2; // minimum tag/category overlap to link

type RelevanceMatch = {
  article: NewsArticleSummary;
  score: number;
};

function calculateRelevance(a: NewsArticle, b: NewsArticleSummary): number {
  let score = 0;
  if (a.category === b.category) score += 3;
  for (const tag of a.tags) {
    if (b.tags.includes(tag)) score += 1;
  }
  // Keyword overlap in titles
  const aWords = new Set(a.title.toLowerCase().split(/\s+/));
  const bWords = b.title.toLowerCase().split(/\s+/);
  for (const w of bWords) {
    if (aWords.has(w) && w.length > 3) score += 0.5;
  }
  return score;
}

function buildArticleLink(slug: string, title: string): InternalLink {
  return {
    url: `https://www.fywarehouse.com/news/${slug}`,
    anchorText: title.length > 60 ? title.slice(0, 57) + '...' : title,
    type: 'news-article',
  };
}

function insertLinkInContent(content: string, link: InternalLink): string {
  const linkHtml = `<a href="${link.url}">${link.anchorText}</a>`;
  const relatedBlock = `<p>Related: ${linkHtml}</p>`;

  // Insert before the last </h2> or before the last paragraph
  const lastH2 = content.lastIndexOf('<h2');
  if (lastH2 > content.length * 0.5) {
    // Insert before the last H2 section
    return content.slice(0, lastH2) + relatedBlock + '\n' + content.slice(lastH2);
  }

  // Insert before the last closing paragraph
  const lastP = content.lastIndexOf('</p>');
  if (lastP > 0) {
    return content.slice(0, lastP + 4) + '\n' + relatedBlock + content.slice(lastP + 4);
  }

  return content + '\n' + relatedBlock;
}

export async function interlinkNewArticle(newSlug: string): Promise<{
  linksAdded: number;
  articlesUpdated: string[];
}> {
  const newArticle = await getArticle(newSlug);
  if (!newArticle || newArticle.status !== 'published') {
    return { linksAdded: 0, articlesUpdated: [] };
  }

  const allPublished = await listArticles({ status: 'published' });
  const others = allPublished.filter((a) => a.slug !== newSlug);

  // Score relevance
  const matches: RelevanceMatch[] = others
    .map((a) => ({ article: a, score: calculateRelevance(newArticle, a) }))
    .filter((m) => m.score >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_INTERLINKS_PER_ARTICLE);

  if (matches.length === 0) {
    return { linksAdded: 0, articlesUpdated: [] };
  }

  let linksAdded = 0;
  const articlesUpdated: string[] = [];

  // Step 1: Add links from NEW article → related OLD articles
  const newLinks = [...newArticle.internalLinks];
  let newContent = newArticle.content;
  const existingUrls = new Set(newLinks.map((l) => l.url));

  for (const match of matches) {
    const link = buildArticleLink(match.article.slug, match.article.title);
    if (existingUrls.has(link.url)) continue;

    newLinks.push(link);
    newContent = insertLinkInContent(newContent, link);
    existingUrls.add(link.url);
    linksAdded++;
  }

  if (linksAdded > 0) {
    await updateArticle(newSlug, { content: newContent, internalLinks: newLinks });
    articlesUpdated.push(newSlug);
  }

  // Step 2: Add links from OLD articles → NEW article
  for (const match of matches) {
    try {
      const oldArticle = await getArticle(match.article.slug);
      if (!oldArticle) continue;

      const oldUrls = new Set(oldArticle.internalLinks.map((l) => l.url));
      const newLink = buildArticleLink(newSlug, newArticle.title);
      if (oldUrls.has(newLink.url)) continue;

      // Check if already has enough article interlinks
      const existingArticleLinks = oldArticle.internalLinks.filter((l) => l.type === 'news-article');
      if (existingArticleLinks.length >= MAX_INTERLINKS_PER_ARTICLE) continue;

      const updatedLinks = [...oldArticle.internalLinks, newLink];
      const updatedContent = insertLinkInContent(oldArticle.content, newLink);
      await updateArticle(match.article.slug, { content: updatedContent, internalLinks: updatedLinks });
      articlesUpdated.push(match.article.slug);
      linksAdded++;
    } catch {
      // Skip if update fails
    }
  }

  return { linksAdded, articlesUpdated };
}

// Batch interlink all existing articles (one-time setup)
export async function interlinkAllArticles(): Promise<{
  totalLinksAdded: number;
  articlesProcessed: number;
}> {
  const published = await listArticles({ status: 'published' });
  let totalLinksAdded = 0;
  let articlesProcessed = 0;

  for (const summary of published) {
    const result = await interlinkNewArticle(summary.slug);
    totalLinksAdded += result.linksAdded;
    if (result.linksAdded > 0) articlesProcessed++;
  }

  return { totalLinksAdded, articlesProcessed };
}
