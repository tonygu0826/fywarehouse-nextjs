import {
  getNewsStorage,
  type NewsArticle,
  type NewsArticleSummary,
  type NewsCategory,
  type ArticleFilter,
  type InternalLink,
} from './news-store';
import { sanitizeHtml } from './html-sanitizer';

// Re-export types for convenience
export type {
  NewsArticle,
  NewsArticleSummary,
  NewsCategory,
  ArticleFilter,
  InternalLink,
};

// ==================== Input Types ====================

export type ArticleInput = {
  title: string;
  metaDescription?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  targetKeyword?: string;
  secondaryKeywords?: string[];
  internalLinks?: InternalLink[];
  source?: 'ai-generated' | 'external' | 'hybrid';
  sourceUrl?: string | null;
  status?: 'draft' | 'published';
};

// ==================== Helpers ====================

function generateId(): string {
  return crypto.randomUUID();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

function generateExcerpt(content: string, maxLength = 160): string {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).replace(/\s\S*$/, '') + '...';
}

// ==================== Storage Access ====================

function storage() {
  return getNewsStorage();
}

// ==================== Article CRUD ====================

export async function createArticle(input: ArticleInput): Promise<NewsArticle> {
  if (!input.title?.trim()) {
    throw new Error('Title is required.');
  }
  if (!input.content?.trim()) {
    throw new Error('Content is required.');
  }

  // Deduplication: check title and sourceUrl
  const existing = await storage().listArticles();
  const normalizedTitle = input.title.trim().toLowerCase();
  if (existing.some((a) => a.title.toLowerCase() === normalizedTitle)) {
    throw new Error('Article with this title already exists.');
  }
  if (input.sourceUrl) {
    const store = storage();
    for (const a of existing) {
      const full = await store.getArticle(a.slug);
      if (full?.sourceUrl === input.sourceUrl) {
        throw new Error('Article from this source URL already exists.');
      }
    }
  }

  const now = new Date().toISOString();
  const safeContent = sanitizeHtml(input.content);
  const wordCount = countWords(safeContent);
  const slug = slugify(input.title) + '-' + generateId().slice(0, 8);

  const article: NewsArticle = {
    id: generateId(),
    slug,
    title: input.title.trim(),
    metaDescription: input.metaDescription?.trim() || generateExcerpt(safeContent),
    excerpt: input.excerpt?.trim() || generateExcerpt(safeContent),
    content: safeContent,
    featuredImage: input.featuredImage || '',
    featuredImageAlt: input.featuredImageAlt || input.title.trim(),
    author: input.author || 'FENGYE LOGISTICS',
    category: input.category || 'Industry News',
    tags: input.tags || [],
    targetKeyword: input.targetKeyword || '',
    secondaryKeywords: input.secondaryKeywords || [],
    internalLinks: input.internalLinks || [],
    status: input.status || 'draft',
    source: input.source || 'ai-generated',
    sourceUrl: input.sourceUrl || null,
    publishedAt: input.status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
    seoScore: 0,
    wordCount,
    readingTimeMinutes: estimateReadingTime(wordCount),
  };

  await storage().saveArticle(article);
  return article;
}

export async function updateArticle(
  slug: string,
  input: Partial<ArticleInput>,
): Promise<NewsArticle> {
  const existing = await storage().getArticle(slug);
  if (!existing) {
    throw new Error('Article not found.');
  }

  const updated: NewsArticle = {
    ...existing,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.metaDescription !== undefined && { metaDescription: input.metaDescription.trim() }),
    ...(input.excerpt !== undefined && { excerpt: input.excerpt.trim() }),
    ...(input.content !== undefined && {
      content: sanitizeHtml(input.content),
      wordCount: countWords(input.content),
      readingTimeMinutes: estimateReadingTime(countWords(input.content)),
    }),
    ...(input.featuredImage !== undefined && { featuredImage: input.featuredImage }),
    ...(input.featuredImageAlt !== undefined && { featuredImageAlt: input.featuredImageAlt }),
    ...(input.author !== undefined && { author: input.author }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.targetKeyword !== undefined && { targetKeyword: input.targetKeyword }),
    ...(input.secondaryKeywords !== undefined && { secondaryKeywords: input.secondaryKeywords }),
    ...(input.internalLinks !== undefined && { internalLinks: input.internalLinks }),
    ...(input.source !== undefined && { source: input.source }),
    ...(input.sourceUrl !== undefined && { sourceUrl: input.sourceUrl }),
    updatedAt: new Date().toISOString(),
  };

  await storage().saveArticle(updated);
  return updated;
}

export async function deleteArticle(slug: string): Promise<void> {
  const existing = await storage().getArticle(slug);
  if (!existing) {
    throw new Error('Article not found.');
  }
  await storage().deleteArticle(slug);
}

export async function getArticle(slug: string): Promise<NewsArticle | null> {
  return storage().getArticle(slug);
}

export async function getArticleById(id: string): Promise<NewsArticle | null> {
  return storage().getArticleById(id);
}

export async function listArticles(filter?: ArticleFilter): Promise<NewsArticleSummary[]> {
  return storage().listArticles(filter);
}

// ==================== Publish / Archive ====================

export async function publishArticle(slug: string): Promise<NewsArticle> {
  const article = await storage().getArticle(slug);
  if (!article) {
    throw new Error('Article not found.');
  }
  if (article.status === 'published') {
    throw new Error('Article is already published.');
  }

  const now = new Date().toISOString();
  const updated: NewsArticle = {
    ...article,
    status: 'published',
    publishedAt: now,
    updatedAt: now,
  };

  await storage().saveArticle(updated);
  return updated;
}

export async function archiveArticle(slug: string): Promise<NewsArticle> {
  const article = await storage().getArticle(slug);
  if (!article) {
    throw new Error('Article not found.');
  }

  const updated: NewsArticle = {
    ...article,
    status: 'archived',
    updatedAt: new Date().toISOString(),
  };

  await storage().saveArticle(updated);
  return updated;
}

// ==================== Categories ====================

export async function listCategories(): Promise<NewsCategory[]> {
  return storage().listCategories();
}

export async function createCategory(
  name: string,
  description = '',
): Promise<NewsCategory> {
  const categories = await storage().listCategories();
  const slug = slugify(name);

  if (categories.some((c) => c.slug === slug)) {
    throw new Error('Category already exists.');
  }

  const category: NewsCategory = {
    id: generateId(),
    name: name.trim(),
    slug,
    description: description.trim(),
    articleCount: 0,
  };

  categories.push(category);
  await storage().saveCategories(categories);
  return category;
}

// ==================== Related News ====================

export async function getRelatedNews(
  slug: string,
  limit = 3,
): Promise<NewsArticleSummary[]> {
  const article = await storage().getArticle(slug);
  if (!article) return [];

  const all = await storage().listArticles({ status: 'published' });
  const others = all.filter((a) => a.slug !== slug);

  // Score by matching category and tags
  const scored = others.map((a) => {
    let score = 0;
    if (a.category === article.category) score += 3;
    for (const tag of a.tags) {
      if (article.tags.includes(tag)) score += 1;
    }
    return { article: a, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.article);
}

// ==================== Published article helpers ====================

/**
 * Convert a category name to a URL-friendly slug.
 * "Customs & Regulations" → "customs-regulations"
 */
export function categorySlugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export async function listPublishedArticles(limit?: number): Promise<NewsArticleSummary[]> {
  return storage().listArticles({ status: 'published', limit });
}

export async function listArticlesByCategory(categorySlug: string): Promise<NewsArticleSummary[]> {
  const all = await storage().listArticles({ status: 'published' });
  return all.filter((a) => categorySlugify(a.category) === categorySlug);
}

export async function listArticlesByTag(tag: string): Promise<NewsArticleSummary[]> {
  const all = await storage().listArticles({ status: 'published' });
  return all.filter((a) =>
    a.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

export async function getPublishedArticle(slug: string): Promise<NewsArticle | null> {
  const article = await storage().getArticle(slug);
  if (!article || article.status !== 'published') return null;
  return article;
}
