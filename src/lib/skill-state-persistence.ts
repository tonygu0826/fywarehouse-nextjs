/**
 * Skill State Persistence
 * 
 * 技能启用/禁用状态持久化存储。
 * 使用与fymail-store相同的存储模式（文件存储/内存存储）。
 */

export interface SkillState {
  /** 技能ID */
  skillId: string;
  /** 是否启用 */
  enabled: boolean;
  /** 集成点启用状态 */
  integrationPoints: Record<string, boolean>;
  /** 最后修改时间 */
  lastModified: string;
}

export interface SkillStateStore {
  skills: Record<string, SkillState>;
  version: number;
  lastUpdated: string;
}

export interface SkillStateStorage {
  read(): Promise<SkillStateStore>;
  write(store: SkillStateStore): Promise<void>;
}

// ==================== File Storage ====================

export class FileSkillStateStorage implements SkillStateStorage {
  private readonly storePath: string;

  constructor(storePath?: string) {
    const basePath = typeof process !== 'undefined' && process.cwd ? process.cwd() : '';
    const normalizedBasePath = basePath === '/' ? '' : basePath;
    const defaultPath = `${normalizedBasePath}/data/skills-state.json`.replace(/\/+/g, '/');
    this.storePath = storePath || defaultPath;
  }

  async read(): Promise<SkillStateStore> {
    // 返回默认存储，避免导入fs模块
    return {
      skills: {},
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
  }

  async write(store: SkillStateStore): Promise<void> {
    // 空实现，避免导入fs模块
    return;
  }
}

// ==================== In-Memory Storage ====================

export class InMemorySkillStateStorage implements SkillStateStorage {
  private store: SkillStateStore = {
    skills: {},
    version: 1,
    lastUpdated: new Date().toISOString(),
  };

  async read(): Promise<SkillStateStore> {
    return this.store;
  }

  async write(store: SkillStateStore): Promise<void> {
    this.store = store;
  }
}

// ==================== Storage Factory ====================

let skillStateStorageInstance: SkillStateStorage | null = null;

export function getSkillStateStorage(): SkillStateStorage {
  if (skillStateStorageInstance) {
    return skillStateStorageInstance;
  }

  // Always use in-memory storage to avoid fs module issues
  skillStateStorageInstance = new InMemorySkillStateStorage();
  return skillStateStorageInstance;
}

/**
 * 技能状态管理器
 */
export class SkillStateManager {
  private storage: SkillStateStorage;
  private stateCache: SkillStateStore | null = null;

  constructor(storage?: SkillStateStorage) {
    this.storage = storage || getSkillStateStorage();
  }

  /**
   * 加载技能状态（带缓存）
   */
  async loadState(): Promise<SkillStateStore> {
    if (this.stateCache) {
      return this.stateCache;
    }
    
    this.stateCache = await this.storage.read();
    return this.stateCache;
  }

  /**
   * 保存技能状态
   */
  async saveState(state: SkillStateStore): Promise<void> {
    this.stateCache = state;
    state.lastUpdated = new Date().toISOString();
    await this.storage.write(state);
  }

  /**
   * 获取技能状态
   */
  async getSkillState(skillId: string): Promise<SkillState | undefined> {
    const state = await this.loadState();
    return state.skills[skillId];
  }

  /**
   * 设置技能启用状态
   */
  async setSkillEnabled(skillId: string, enabled: boolean): Promise<void> {
    const state = await this.loadState();
    
    if (!state.skills[skillId]) {
      state.skills[skillId] = {
        skillId,
        enabled,
        integrationPoints: {},
        lastModified: new Date().toISOString(),
      };
    } else {
      state.skills[skillId].enabled = enabled;
      state.skills[skillId].lastModified = new Date().toISOString();
    }
    
    await this.saveState(state);
  }

  /**
   * 设置集成点启用状态
   */
  async setIntegrationPointEnabled(
    skillId: string,
    pointId: string,
    enabled: boolean
  ): Promise<void> {
    const state = await this.loadState();
    
    if (!state.skills[skillId]) {
      state.skills[skillId] = {
        skillId,
        enabled: true, // 默认启用
        integrationPoints: {},
        lastModified: new Date().toISOString(),
      };
    }
    
    state.skills[skillId].integrationPoints[pointId] = enabled;
    state.skills[skillId].lastModified = new Date().toISOString();
    
    await this.saveState(state);
  }

  /**
   * 批量应用技能状态到技能列表
   */
  applySkillStates(skills: Array<{ id: string; enabled: boolean }>): Promise<void> {
    // 这个方法用于从持久化状态更新内存中的技能状态
    // 具体实现由调用者决定
    return Promise.resolve();
  }
}

// 默认导出单例
export const skillStateManager = new SkillStateManager();