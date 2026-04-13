// KVNamespace interface compatible with Cloudflare Workers
export interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

// ==================== News Data Types ====================

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  content: string; // HTML
  featuredImage: string;
  featuredImageAlt: string;
  author: string;
  category: string;
  tags: string[];
  targetKeyword: string;
  secondaryKeywords: string[];
  internalLinks: InternalLink[];
  status: 'draft' | 'published' | 'archived';
  source: 'ai-generated' | 'external' | 'hybrid';
  sourceUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seoScore: number;
  wordCount: number;
  readingTimeMinutes: number;
};

export type InternalLink = {
  url: string;
  anchorText: string;
  type: 'money-page' | 'news-article';
};

export type NewsArticleSummary = Pick<
  NewsArticle,
  'id' | 'slug' | 'title' | 'excerpt' | 'featuredImage' | 'featuredImageAlt' |
  'category' | 'tags' | 'status' | 'source' | 'publishedAt' | 'createdAt' |
  'readingTimeMinutes' | 'author'
>;

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
};

// ==================== News Storage Interface ====================

export interface NewsStorage {
  // Articles
  getArticle(slug: string): Promise<NewsArticle | null>;
  getArticleById(id: string): Promise<NewsArticle | null>;
  listArticles(filter?: ArticleFilter): Promise<NewsArticleSummary[]>;
  saveArticle(article: NewsArticle): Promise<void>;
  deleteArticle(slug: string): Promise<void>;

  // Categories
  listCategories(): Promise<NewsCategory[]>;
  saveCategories(categories: NewsCategory[]): Promise<void>;
}

export type ArticleFilter = {
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
};

// ==================== KV News Storage (production) ====================

export class KVNewsStorage implements NewsStorage {
  private readonly kv: KVNamespace;
  private readonly prefix = 'news';

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  private key(name: string): string {
    return `${this.prefix}:${name}`;
  }

  async getArticle(slug: string): Promise<NewsArticle | null> {
    try {
      const data = await this.kv.get(this.key(`articles:${slug}`), 'json');
      return data as NewsArticle | null;
    } catch {
      return null;
    }
  }

  async getArticleById(id: string): Promise<NewsArticle | null> {
    try {
      // id -> slug mapping
      const slug = await this.kv.get(this.key(`articles:id:${id}`));
      if (!slug) return null;
      return this.getArticle(slug);
    } catch {
      return null;
    }
  }

  async listArticles(filter?: ArticleFilter): Promise<NewsArticleSummary[]> {
    try {
      const data = await this.kv.get(this.key('articles:index'), 'json');
      let articles = (data as NewsArticleSummary[] | null) || [];

      if (filter?.status) {
        articles = articles.filter((a) => a.status === filter.status);
      }
      if (filter?.category) {
        articles = articles.filter((a) => a.category === filter.category);
      }
      if (filter?.tag) {
        articles = articles.filter((a) => a.tags.includes(filter.tag!));
      }

      // Sort by publishedAt desc (published first), then createdAt desc
      articles.sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const offset = filter?.offset || 0;
      const limit = filter?.limit || articles.length;
      return articles.slice(offset, offset + limit);
    } catch (error) {
      console.error('News KV listArticles error:', error);
      return [];
    }
  }

  async saveArticle(article: NewsArticle): Promise<void> {
    try {
      // Save full article by slug
      await this.kv.put(this.key(`articles:${article.slug}`), JSON.stringify(article));

      // Save id -> slug mapping
      await this.kv.put(this.key(`articles:id:${article.id}`), article.slug);

      // Update index
      const index = await this.listArticles();
      const summary: NewsArticleSummary = {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        featuredImage: article.featuredImage,
        featuredImageAlt: article.featuredImageAlt,
        category: article.category,
        tags: article.tags,
        status: article.status,
        source: article.source,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        readingTimeMinutes: article.readingTimeMinutes,
        author: article.author,
      };

      const existingIdx = index.findIndex((a) => a.id === article.id);
      if (existingIdx >= 0) {
        index[existingIdx] = summary;
      } else {
        index.unshift(summary);
      }

      await this.kv.put(this.key('articles:index'), JSON.stringify(index));
    } catch (error) {
      console.error('News KV saveArticle error:', error);
      throw error;
    }
  }

  async deleteArticle(slug: string): Promise<void> {
    try {
      const article = await this.getArticle(slug);
      if (!article) return;

      // Remove full article
      await this.kv.delete(this.key(`articles:${slug}`));
      // Remove id mapping
      await this.kv.delete(this.key(`articles:id:${article.id}`));

      // Update index
      const index = await this.listArticles();
      const filtered = index.filter((a) => a.slug !== slug);
      await this.kv.put(this.key('articles:index'), JSON.stringify(filtered));
    } catch (error) {
      console.error('News KV deleteArticle error:', error);
      throw error;
    }
  }

  async listCategories(): Promise<NewsCategory[]> {
    try {
      const data = await this.kv.get(this.key('categories'), 'json');
      return (data as NewsCategory[] | null) || [];
    } catch {
      return [];
    }
  }

  async saveCategories(categories: NewsCategory[]): Promise<void> {
    await this.kv.put(this.key('categories'), JSON.stringify(categories));
  }
}

// ==================== In-Memory News Storage (development/fallback) ====================

export class InMemoryNewsStorage implements NewsStorage {
  private articles: Map<string, NewsArticle> = new Map();
  private idToSlug: Map<string, string> = new Map();
  private categories: NewsCategory[] = [];

  async getArticle(slug: string): Promise<NewsArticle | null> {
    return this.articles.get(slug) || null;
  }

  async getArticleById(id: string): Promise<NewsArticle | null> {
    const slug = this.idToSlug.get(id);
    if (!slug) return null;
    return this.articles.get(slug) || null;
  }

  async listArticles(filter?: ArticleFilter): Promise<NewsArticleSummary[]> {
    let articles = Array.from(this.articles.values());

    if (filter?.status) {
      articles = articles.filter((a) => a.status === filter.status);
    }
    if (filter?.category) {
      articles = articles.filter((a) => a.category === filter.category);
    }
    if (filter?.tag) {
      articles = articles.filter((a) => a.tags.includes(filter.tag!));
    }

    articles.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    const offset = filter?.offset || 0;
    const limit = filter?.limit || articles.length;

    return articles.slice(offset, offset + limit).map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      featuredImage: a.featuredImage,
      featuredImageAlt: a.featuredImageAlt,
      category: a.category,
      tags: a.tags,
      status: a.status,
      source: a.source,
      publishedAt: a.publishedAt,
      createdAt: a.createdAt,
      readingTimeMinutes: a.readingTimeMinutes,
      author: a.author,
    }));
  }

  async saveArticle(article: NewsArticle): Promise<void> {
    this.articles.set(article.slug, article);
    this.idToSlug.set(article.id, article.slug);
  }

  async deleteArticle(slug: string): Promise<void> {
    const article = this.articles.get(slug);
    if (article) {
      this.idToSlug.delete(article.id);
    }
    this.articles.delete(slug);
  }

  async listCategories(): Promise<NewsCategory[]> {
    return this.categories;
  }

  async saveCategories(categories: NewsCategory[]): Promise<void> {
    this.categories = categories;
  }
}

// ==================== File-based Storage (Node.js / PM2 production) ====================

export class FileNewsStorage implements NewsStorage {
  private readonly basePath: string;

  constructor(basePath?: string) {
    const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '';
    this.basePath = basePath || `${cwd}/data/news`;
  }

  private async ensureDir(): Promise<void> {
    try {
      const fs = await import('fs');
      if (!fs.existsSync(this.basePath)) {
        fs.mkdirSync(this.basePath, { recursive: true });
      }
    } catch { /* Edge Runtime fallback - skip */ }
  }

  private async readJson<T>(filename: string, fallback: T): Promise<T> {
    try {
      const fs = await import('fs');
      const path = `${this.basePath}/${filename}`;
      if (!fs.existsSync(path)) return fallback;
      const raw = fs.readFileSync(path, 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private async writeJson(filename: string, data: unknown): Promise<void> {
    await this.ensureDir();
    const fs = await import('fs');
    fs.writeFileSync(`${this.basePath}/${filename}`, JSON.stringify(data, null, 2));
  }

  async getArticle(slug: string): Promise<NewsArticle | null> {
    return this.readJson<NewsArticle | null>(`articles/${slug}.json`, null);
  }

  async getArticleById(id: string): Promise<NewsArticle | null> {
    const mapping = await this.readJson<Record<string, string>>('id-map.json', {});
    const slug = mapping[id];
    if (!slug) return null;
    return this.getArticle(slug);
  }

  async listArticles(filter?: ArticleFilter): Promise<NewsArticleSummary[]> {
    let index = await this.readJson<NewsArticleSummary[]>('index.json', []);

    if (filter?.status) index = index.filter((a) => a.status === filter.status);
    if (filter?.category) index = index.filter((a) => a.category === filter.category);
    if (filter?.tag) index = index.filter((a) => a.tags.includes(filter.tag!));

    index.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    const offset = filter?.offset || 0;
    const limit = filter?.limit || index.length;
    return index.slice(offset, offset + limit);
  }

  async saveArticle(article: NewsArticle): Promise<void> {
    await this.ensureDir();
    const fs = await import('fs');
    const articlesDir = `${this.basePath}/articles`;
    if (!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir, { recursive: true });

    // Save full article
    await this.writeJson(`articles/${article.slug}.json`, article);

    // Update id mapping
    const mapping = await this.readJson<Record<string, string>>('id-map.json', {});
    mapping[article.id] = article.slug;
    await this.writeJson('id-map.json', mapping);

    // Update index
    const index = await this.readJson<NewsArticleSummary[]>('index.json', []);
    const summary: NewsArticleSummary = {
      id: article.id, slug: article.slug, title: article.title, excerpt: article.excerpt,
      featuredImage: article.featuredImage, featuredImageAlt: article.featuredImageAlt,
      category: article.category, tags: article.tags, status: article.status,
      source: article.source, publishedAt: article.publishedAt, createdAt: article.createdAt,
      readingTimeMinutes: article.readingTimeMinutes, author: article.author,
    };
    const existingIdx = index.findIndex((a) => a.id === article.id);
    if (existingIdx >= 0) {
      index[existingIdx] = summary;
    } else {
      index.unshift(summary);
    }
    await this.writeJson('index.json', index);
  }

  async deleteArticle(slug: string): Promise<void> {
    const article = await this.getArticle(slug);
    if (!article) return;

    try {
      const fs = await import('fs');
      const path = `${this.basePath}/articles/${slug}.json`;
      if (fs.existsSync(path)) fs.unlinkSync(path);
    } catch { /* ignore */ }

    // Update id mapping
    const mapping = await this.readJson<Record<string, string>>('id-map.json', {});
    delete mapping[article.id];
    await this.writeJson('id-map.json', mapping);

    // Update index
    const index = await this.readJson<NewsArticleSummary[]>('index.json', []);
    await this.writeJson('index.json', index.filter((a) => a.slug !== slug));
  }

  async listCategories(): Promise<NewsCategory[]> {
    return this.readJson<NewsCategory[]>('categories.json', []);
  }

  async saveCategories(categories: NewsCategory[]): Promise<void> {
    await this.writeJson('categories.json', categories);
  }
}

// ==================== Storage Factory ====================

let storageInstance: NewsStorage | null = null;

export function getNewsStorage(): NewsStorage {
  if (storageInstance) return storageInstance;

  // Use file storage for Node.js / PM2 deployment (persistent) — check first
  try {
    const fs = require('fs');
    if (typeof fs.existsSync === 'function' && fs.existsSync(process.cwd() + '/data/news')) {
      storageInstance = new FileNewsStorage();
      return storageInstance;
    }
  } catch { /* Edge Runtime, fs not available */ }

  // Try Cloudflare KV (for CF Pages deployment)
  try {
    const { getRequestContext } = require('@cloudflare/next-on-pages');
    const ctx = getRequestContext();
    const kv = ctx.env?.FYMAIL_KV as KVNamespace | undefined;
    if (kv) {
      storageInstance = new KVNewsStorage(kv);
      return storageInstance;
    }
  } catch { /* not in CF Pages environment */ }

  // Fallback to in-memory (dev only)
  storageInstance = new InMemoryNewsStorage();
  return storageInstance;
}
