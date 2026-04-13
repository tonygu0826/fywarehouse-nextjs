// Keyword storage with file-based persistence (same pattern as news-store)

export type KeywordEntry = {
  id: string;
  keyword: string;
  searchVolume: number;        // estimated monthly search volume
  difficulty: number;          // 0-100, competition difficulty
  funnelPosition: 'top' | 'middle' | 'bottom';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  opportunity: number;         // calculated opportunity score 0-100
  status: 'discovered' | 'approved' | 'in-progress' | 'published' | 'rejected';
  relatedNewsSlug: string | null;
  source: string;              // how it was discovered
  category: string;
  tags: string[];
  lastUsed: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type KeywordFilter = {
  status?: KeywordEntry['status'];
  funnelPosition?: KeywordEntry['funnelPosition'];
  intent?: KeywordEntry['intent'];
  category?: string;
  minOpportunity?: number;
  limit?: number;
  offset?: number;
};

export interface KeywordStorage {
  get(id: string): Promise<KeywordEntry | null>;
  list(filter?: KeywordFilter): Promise<KeywordEntry[]>;
  save(entry: KeywordEntry): Promise<void>;
  delete(id: string): Promise<void>;
  getByKeyword(keyword: string): Promise<KeywordEntry | null>;
}

// ==================== File-based Keyword Storage ====================

export class FileKeywordStorage implements KeywordStorage {
  private readonly basePath: string;

  constructor(basePath?: string) {
    const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '';
    this.basePath = basePath || `${cwd}/data/keywords`;
  }

  private async ensureDir(): Promise<void> {
    try {
      const fs = await import('fs');
      if (!fs.existsSync(this.basePath)) {
        fs.mkdirSync(this.basePath, { recursive: true });
      }
    } catch { /* skip */ }
  }

  private async readJson<T>(filename: string, fallback: T): Promise<T> {
    try {
      const fs = await import('fs');
      const path = `${this.basePath}/${filename}`;
      if (!fs.existsSync(path)) return fallback;
      return JSON.parse(fs.readFileSync(path, 'utf-8')) as T;
    } catch {
      return fallback;
    }
  }

  private async writeJson(filename: string, data: unknown): Promise<void> {
    await this.ensureDir();
    const fs = await import('fs');
    fs.writeFileSync(`${this.basePath}/${filename}`, JSON.stringify(data, null, 2));
  }

  async get(id: string): Promise<KeywordEntry | null> {
    const all = await this.readJson<KeywordEntry[]>('keywords.json', []);
    return all.find((k) => k.id === id) || null;
  }

  async getByKeyword(keyword: string): Promise<KeywordEntry | null> {
    const all = await this.readJson<KeywordEntry[]>('keywords.json', []);
    const lower = keyword.toLowerCase().trim();
    return all.find((k) => k.keyword.toLowerCase() === lower) || null;
  }

  async list(filter?: KeywordFilter): Promise<KeywordEntry[]> {
    let entries = await this.readJson<KeywordEntry[]>('keywords.json', []);

    if (filter?.status) entries = entries.filter((k) => k.status === filter.status);
    if (filter?.funnelPosition) entries = entries.filter((k) => k.funnelPosition === filter.funnelPosition);
    if (filter?.intent) entries = entries.filter((k) => k.intent === filter.intent);
    if (filter?.category) entries = entries.filter((k) => k.category === filter.category);
    if (filter?.minOpportunity) entries = entries.filter((k) => k.opportunity >= filter.minOpportunity!);

    // Sort by opportunity desc
    entries.sort((a, b) => b.opportunity - a.opportunity);

    const offset = filter?.offset || 0;
    const limit = filter?.limit || entries.length;
    return entries.slice(offset, offset + limit);
  }

  async save(entry: KeywordEntry): Promise<void> {
    const all = await this.readJson<KeywordEntry[]>('keywords.json', []);
    const idx = all.findIndex((k) => k.id === entry.id);
    if (idx >= 0) {
      all[idx] = entry;
    } else {
      all.push(entry);
    }
    await this.writeJson('keywords.json', all);
  }

  async delete(id: string): Promise<void> {
    const all = await this.readJson<KeywordEntry[]>('keywords.json', []);
    await this.writeJson('keywords.json', all.filter((k) => k.id !== id));
  }
}

// ==================== Storage Factory ====================

let keywordStorageInstance: KeywordStorage | null = null;

export function getKeywordStorage(): KeywordStorage {
  if (keywordStorageInstance) return keywordStorageInstance;
  keywordStorageInstance = new FileKeywordStorage();
  return keywordStorageInstance;
}
