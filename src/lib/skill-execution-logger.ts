/**
 * Skill Execution Logger
 * 
 * 记录技能执行结果，用于调试、分析和审计。
 */

export interface SkillExecutionLog {
  /** 日志ID */
  id: string;
  /** 技能ID */
  skillId: string;
  /** 技能名称 */
  skillName: string;
  /** 执行类型：skill（单个技能）| workflowStage（工作流阶段） */
  executionType: 'skill' | 'workflowStage';
  /** 工作流阶段（如果适用） */
  workflowStage?: string;
  /** 执行上下文摘要 */
  contextSummary: Record<string, any>;
  /** 执行参数 */
  params?: Record<string, any>;
  /** 执行结果 */
  result: {
    success: boolean;
    message?: string;
    error?: string;
    data?: Record<string, any>;
    durationMs: number;
  };
  /** 执行时间戳 */
  timestamp: string;
  /** 执行用户（如有） */
  userId?: string;
  /** 会话ID（如有） */
  sessionId?: string;
  /** 是否已存档（压缩） */
  archived: boolean;
}

export interface SkillExecutionLogStore {
  logs: SkillExecutionLog[];
  version: number;
  lastUpdated: string;
}

export interface SkillExecutionLoggerStorage {
  read(): Promise<SkillExecutionLogStore>;
  write(store: SkillExecutionLogStore): Promise<void>;
  append(log: SkillExecutionLog): Promise<void>;
  query(options?: SkillExecutionLogQueryOptions): Promise<SkillExecutionLog[]>;
}

export interface SkillExecutionLogQueryOptions {
  skillId?: string;
  startDate?: string;
  endDate?: string;
  successOnly?: boolean;
  limit?: number;
  offset?: number;
}

// ==================== In-Memory Storage ====================

export class InMemorySkillExecutionLoggerStorage implements SkillExecutionLoggerStorage {
  private store: SkillExecutionLogStore = {
    logs: [],
    version: 1,
    lastUpdated: new Date().toISOString(),
  };

  async read(): Promise<SkillExecutionLogStore> {
    return this.store;
  }

  async write(store: SkillExecutionLogStore): Promise<void> {
    this.store = store;
  }

  async append(log: SkillExecutionLog): Promise<void> {
    this.store.logs.unshift(log);
    // 限制日志数量（内存中保留100条）
    if (this.store.logs.length > 100) {
      this.store.logs = this.store.logs.slice(0, 100);
    }
    this.store.lastUpdated = new Date().toISOString();
  }

  async query(options?: SkillExecutionLogQueryOptions): Promise<SkillExecutionLog[]> {
    let logs = this.store.logs;

    if (options?.skillId) {
      logs = logs.filter(log => log.skillId === options.skillId);
    }

    if (options?.startDate) {
      const start = new Date(options.startDate).getTime();
      logs = logs.filter(log => new Date(log.timestamp).getTime() >= start);
    }

    if (options?.endDate) {
      const end = new Date(options.endDate).getTime();
      logs = logs.filter(log => new Date(log.timestamp).getTime() <= end);
    }

    if (options?.successOnly) {
      logs = logs.filter(log => log.result.success);
    }

    if (options?.offset) {
      logs = logs.slice(options.offset);
    }

    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }
}

// ==================== Storage Factory ====================

let skillExecutionLoggerStorageInstance: SkillExecutionLoggerStorage | null = null;

export function getSkillExecutionLoggerStorage(): SkillExecutionLoggerStorage {
  if (skillExecutionLoggerStorageInstance) {
    return skillExecutionLoggerStorageInstance;
  }

  // Always use in-memory storage to avoid fs module issues
  skillExecutionLoggerStorageInstance = new InMemorySkillExecutionLoggerStorage();
  return skillExecutionLoggerStorageInstance;
}

/**
 * 技能执行日志记录器
 */
export class SkillExecutionLogger {
  protected storage: SkillExecutionLoggerStorage;

  constructor(storage?: SkillExecutionLoggerStorage) {
    this.storage = storage || getSkillExecutionLoggerStorage();
  }

  /**
   * 获取存储实例（用于监控桥接）
   */
  getStorage(): SkillExecutionLoggerStorage {
    return this.storage;
  }

  /**
   * 记录技能执行结果
   */
  async logSkillExecution(
    skillId: string,
    skillName: string,
    executionType: 'skill' | 'workflowStage',
    result: any,
    context?: any,
    params?: Record<string, any>,
    userId?: string,
    sessionId?: string
  ): Promise<string> {
    const logId = crypto.randomUUID();
    
    const log: SkillExecutionLog = {
      id: logId,
      skillId,
      skillName,
      executionType,
      workflowStage: context?.workflowStage,
      contextSummary: this.summarizeContext(context),
      params,
      result: {
        success: result.success !== false,
        message: result.message,
        error: result.error,
        data: result.data,
        durationMs: result.durationMs || 0,
      },
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      archived: false,
    };

    await this.storage.append(log);
    return logId;
  }

  /**
   * 查询执行日志
   */
  async queryLogs(options?: SkillExecutionLogQueryOptions): Promise<SkillExecutionLog[]> {
    return this.storage.query(options);
  }

  /**
   * 获取最近日志
   */
  async getRecentLogs(limit: number = 20): Promise<SkillExecutionLog[]> {
    return this.queryLogs({ limit });
  }

  /**
   * 获取技能执行统计
   */
  async getSkillStatistics(skillId?: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDurationMs: number;
    lastExecution?: string;
  }> {
    const logs = await this.queryLogs({ skillId });
    
    if (logs.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageDurationMs: 0,
      };
    }

    const successful = logs.filter(log => log.result.success);
    const failed = logs.filter(log => !log.result.success);
    const totalDuration = logs.reduce((sum, log) => sum + (log.result.durationMs || 0), 0);
    const averageDuration = totalDuration / logs.length;

    return {
      totalExecutions: logs.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageDurationMs: Math.round(averageDuration),
      lastExecution: logs[0]?.timestamp,
    };
  }

  /**
   * 清除旧日志（保留最近N条）
   */
  async cleanupOldLogs(keep: number = 100): Promise<void> {
    const store = await this.storage.read();
    if (store.logs.length <= keep) {
      return;
    }
    
    store.logs = store.logs.slice(0, keep);
    store.lastUpdated = new Date().toISOString();
    await this.storage.write(store);
  }

  /**
   * 汇总上下文，避免记录过大对象
   */
  private summarizeContext(context: any): Record<string, any> {
    if (!context) {
      return {};
    }

    const summary: Record<string, any> = {
      hasContact: !!context.contact,
      hasContacts: !!context.contacts,
      hasTemplate: !!context.template,
      hasJob: !!context.job,
      workflowStage: context.workflowStage,
    };

    // 记录关键字段但不记录完整数据
    if (context.contact) {
      summary.contactKeys = Object.keys(context.contact);
    }
    if (context.contacts && Array.isArray(context.contacts)) {
      summary.contactsCount = context.contacts.length;
    }
    if (context.template) {
      summary.templateId = context.template.id || context.template.name;
    }

    return summary;
  }
}

// 默认导出单例
export const skillExecutionLogger = new SkillExecutionLogger();