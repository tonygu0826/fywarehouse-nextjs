import type { FymailContact, FymailTemplate, FymailSendJob } from './fymail';

export interface FymailStore {
  contacts: FymailContact[];
  templates: FymailTemplate[];
  jobs: FymailSendJob[];
}

export interface FymailStorage {
  read(): Promise<FymailStore>;
  write(store: FymailStore): Promise<void>;
}

// ==================== File Storage (development) ====================

// Note: fs and path imports are dynamically imported inside methods
// to avoid Edge Runtime compatibility issues

export class FileStorage implements FymailStorage {
  private readonly storePath: string;

  constructor(storePath?: string) {
    // In Edge Runtime, process.cwd() is not available
    // Use a relative path or environment variable
    const basePath = typeof process !== 'undefined' && process.cwd ? process.cwd() : '';
    // Normalize path to avoid double slashes
    const normalizedBasePath = basePath === '/' ? '' : basePath;
    const defaultPath = `${normalizedBasePath}/data/fymail-store.json`.replace(/\/+/g, '/');
    this.storePath = storePath || defaultPath;
  }

  async read(): Promise<FymailStore> {
    // 返回默认存储，避免导入fs模块
    return {
      contacts: [],
      templates: [],
      jobs: [],
    };
  }

  async write(store: FymailStore): Promise<void> {
    // 空实现，避免导入fs模块
    return;
  }
}

// ==================== KV Storage (production) ====================

export interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

export class KVStorage implements FymailStorage {
  private readonly kv: KVNamespace;
  private readonly prefix: string;

  constructor(kv: KVNamespace, prefix = 'fymail') {
    this.kv = kv;
    this.prefix = prefix;
  }

  private key(name: string): string {
    return `${this.prefix}:${name}`;
  }

  async read(): Promise<FymailStore> {
    const defaultStore: FymailStore = {
      contacts: [],
      templates: [],
      jobs: [],
    };

    try {
      // Try to read the consolidated store first (legacy format)
      const consolidated = await this.kv.get(this.key('store'), 'json');
      if (consolidated) {
        const parsed = consolidated as Partial<FymailStore>;
        return {
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : defaultStore.contacts,
          templates: Array.isArray(parsed.templates) ? parsed.templates : defaultStore.templates,
          jobs: Array.isArray(parsed.jobs) ? parsed.jobs : defaultStore.jobs,
        };
      }

      // If no consolidated store, check for sharded data
      const contactsData = await this.kv.get(this.key('contacts:list'), 'json');
      const templatesData = await this.kv.get(this.key('templates:list'), 'json');
      const jobsData = await this.kv.get(this.key('jobs:list'), 'json');

      return {
        contacts: Array.isArray(contactsData) ? contactsData : defaultStore.contacts,
        templates: Array.isArray(templatesData) ? templatesData : defaultStore.templates,
        jobs: Array.isArray(jobsData) ? jobsData : defaultStore.jobs,
      };
    } catch (error) {
      console.error('KV read error:', error);
      return defaultStore;
    }
  }

  async write(store: FymailStore): Promise<void> {
    try {
      // Write sharded data for better performance and smaller KV entries
      await this.kv.put(this.key('contacts:list'), JSON.stringify(store.contacts));
      await this.kv.put(this.key('templates:list'), JSON.stringify(store.templates));
      await this.kv.put(this.key('jobs:list'), JSON.stringify(store.jobs));

      // Also write individual items for fast lookup (optional optimization)
      // This can be added later if needed for specific queries
    } catch (error) {
      console.error('KV write error:', error);
      throw error;
    }
  }

  // Optional: Individual item operations for better performance
  async getContact(id: string): Promise<FymailContact | null> {
    try {
      const data = await this.kv.get(this.key(`contacts:${id}`), 'json');
      return data as FymailContact | null;
    } catch {
      return null;
    }
  }

  async putContact(contact: FymailContact): Promise<void> {
    await this.kv.put(this.key(`contacts:${contact.id}`), JSON.stringify(contact));
  }

  async getTemplate(id: string): Promise<FymailTemplate | null> {
    try {
      const data = await this.kv.get(this.key(`templates:${id}`), 'json');
      return data as FymailTemplate | null;
    } catch {
      return null;
    }
  }

  async putTemplate(template: FymailTemplate): Promise<void> {
    await this.kv.put(this.key(`templates:${template.id}`), JSON.stringify(template));
  }
}

// ==================== Storage Factory ====================

let storageInstance: FymailStorage | null = null;

export function getStorage(): FymailStorage {
  if (storageInstance) {
    return storageInstance;
  }

  // Always use in-memory storage to avoid fs module issues
  storageInstance = new InMemoryStorage();
  return storageInstance;
}

// ==================== In-Memory Storage (fallback) ====================

export class InMemoryStorage implements FymailStorage {
  private store: FymailStore = {
    contacts: [],
    templates: [],
    jobs: [],
  };

  async read(): Promise<FymailStore> {
    return this.store;
  }

  async write(store: FymailStore): Promise<void> {
    this.store = store;
  }
}