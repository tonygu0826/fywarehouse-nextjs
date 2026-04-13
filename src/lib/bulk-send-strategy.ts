/**
 * Bulk Send Strategy Manager for FYMail
 * 
 * 批量发送策略面板 - 提供可控的发送优化配置
 */

export interface SendStrategy {
  /** 策略ID */
  id: string;
  /** 策略名称 */
  name: string;
  /** 策略描述 */
  description: string;
  /** 是否启用 */
  enabled: boolean;
  
  /** 分批发送配置 */
  batching: {
    /** 批次大小 */
    batchSize: number;
    /** 批次间延迟（分钟） */
    delayBetweenBatches: number;
    /** 最大每日发送量 */
    maxDailySends: number;
    /** 是否智能调整批次大小 */
    adaptiveBatching: boolean;
  };
  
  /** 发送时间优化 */
  timing: {
    /** 启用发送时间优化 */
    enabled: boolean;
    /** 最佳发送时间 */
    optimalSendTime: string;
    /** 工作日发送 */
    sendOnWeekdays: boolean;
    /** 周末发送 */
    sendOnWeekends: boolean;
    /** 时区感知 */
    timezoneAware: boolean;
    /** 避免的时段（例如 "22:00-08:00"） */
    avoidHours: string[];
  };
  
  /** 个性化配置 */
  personalization: {
    /** 个性化级别 */
    level: 'none' | 'basic' | 'advanced' | 'maximum';
    /** 替换字段 */
    replaceFields: string[];
    /** 动态内容 */
    dynamicContent: boolean;
    /** 个性化开场白 */
    personalizedOpening: boolean;
  };
  
  /** 联系人筛选配置 */
  filtering: {
    /** 最小数据质量等级 */
    minDataQuality: 'A' | 'B' | 'C';
    /** 必需字段 */
    requiredFields: string[];
    /** 排除标签 */
    excludeTags: string[];
    /** 包含标签 */
    includeTags: string[];
    /** 地域筛选 */
    countries: string[];
    /** 最近发送间隔（天） */
    minSendIntervalDays: number;
  };
  
  /** A/B测试配置 */
  abTesting: {
    /** 启用A/B测试 */
    enabled: boolean;
    /** 测试组大小百分比 */
    testGroupPercentage: number;
    /** 测试元素 */
    testElements: ('subject' | 'content' | 'sender' | 'timing')[];
    /** 优化目标 */
    optimizationGoal: 'open-rate' | 'click-rate' | 'reply-rate' | 'conversion';
    /** 测试持续时间（小时） */
    testDurationHours: number;
  };
  
  /** 监控与调整 */
  monitoring: {
    /** 实时监控 */
    realtimeMonitoring: boolean;
    /** 性能阈值 */
    performanceThresholds: {
      minOpenRate: number;
      minClickRate: number;
      maxBounceRate: number;
      maxUnsubscribeRate: number;
    };
    /** 自动暂停 */
    autoPause: boolean;
    /** 自动优化 */
    autoOptimize: boolean;
  };
  
  /** 合规与安全 */
  compliance: {
    /** GDPR合规 */
    gdprCompliant: boolean;
    /** 包含退订链接 */
    includeUnsubscribe: boolean;
    /** 退订机制 */
    unsubscribeMechanism: 'link' | 'reply' | 'both';
    /** 发送频率限制 */
    frequencyLimit: 'normal' | 'conservative' | 'aggressive';
    /** 黑名单检查 */
    blacklistCheck: boolean;
  };
  
  /** 策略优先级 */
  priority: number;
  /** 最后修改时间 */
  lastModified: string;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 策略预设
 */
export const STRATEGY_PRESETS: Record<string, SendStrategy> = {
  'conservative': {
    id: 'conservative',
    name: '保守发送策略',
    description: '适合新用户或敏感行业，强调合规性和安全性',
    enabled: true,
    batching: {
      batchSize: 30,
      delayBetweenBatches: 120,
      maxDailySends: 150,
      adaptiveBatching: false,
    },
    timing: {
      enabled: true,
      optimalSendTime: '10:30',
      sendOnWeekdays: true,
      sendOnWeekends: false,
      timezoneAware: true,
      avoidHours: ['22:00-08:00', '12:00-13:00'],
    },
    personalization: {
      level: 'basic',
      replaceFields: ['{firstName}', '{company}'],
      dynamicContent: false,
      personalizedOpening: true,
    },
    filtering: {
      minDataQuality: 'A',
      requiredFields: ['email', 'firstName', 'company'],
      excludeTags: ['bounced', 'unsubscribed', 'complaint'],
      includeTags: [],
      countries: [],
      minSendIntervalDays: 30,
    },
    abTesting: {
      enabled: true,
      testGroupPercentage: 10,
      testElements: ['subject'],
      optimizationGoal: 'open-rate',
      testDurationHours: 24,
    },
    monitoring: {
      realtimeMonitoring: true,
      performanceThresholds: {
        minOpenRate: 0.15,
        minClickRate: 0.05,
        maxBounceRate: 0.05,
        maxUnsubscribeRate: 0.01,
      },
      autoPause: true,
      autoOptimize: false,
    },
    compliance: {
      gdprCompliant: true,
      includeUnsubscribe: true,
      unsubscribeMechanism: 'both',
      frequencyLimit: 'conservative',
      blacklistCheck: true,
    },
    priority: 1,
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  'balanced': {
    id: 'balanced',
    name: '平衡发送策略',
    description: '适合大多数用户，平衡发送速度和转化率',
    enabled: true,
    batching: {
      batchSize: 50,
      delayBetweenBatches: 60,
      maxDailySends: 300,
      adaptiveBatching: true,
    },
    timing: {
      enabled: true,
      optimalSendTime: '11:00',
      sendOnWeekdays: true,
      sendOnWeekends: false,
      timezoneAware: true,
      avoidHours: ['22:00-07:00'],
    },
    personalization: {
      level: 'advanced',
      replaceFields: ['{firstName}', '{lastName}', '{company}', '{industry}'],
      dynamicContent: true,
      personalizedOpening: true,
    },
    filtering: {
      minDataQuality: 'B',
      requiredFields: ['email', 'company'],
      excludeTags: ['bounced', 'unsubscribed'],
      includeTags: [],
      countries: [],
      minSendIntervalDays: 14,
    },
    abTesting: {
      enabled: true,
      testGroupPercentage: 20,
      testElements: ['subject', 'content'],
      optimizationGoal: 'reply-rate',
      testDurationHours: 48,
    },
    monitoring: {
      realtimeMonitoring: true,
      performanceThresholds: {
        minOpenRate: 0.20,
        minClickRate: 0.08,
        maxBounceRate: 0.08,
        maxUnsubscribeRate: 0.02,
      },
      autoPause: true,
      autoOptimize: true,
    },
    compliance: {
      gdprCompliant: true,
      includeUnsubscribe: true,
      unsubscribeMechanism: 'link',
      frequencyLimit: 'normal',
      blacklistCheck: true,
    },
    priority: 2,
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  'aggressive': {
    id: 'aggressive',
    name: '积极发送策略',
    description: '适合有经验的用户，最大化发送速度和覆盖范围',
    enabled: true,
    batching: {
      batchSize: 100,
      delayBetweenBatches: 30,
      maxDailySends: 500,
      adaptiveBatching: true,
    },
    timing: {
      enabled: true,
      optimalSendTime: '09:00',
      sendOnWeekdays: true,
      sendOnWeekends: true,
      timezoneAware: true,
      avoidHours: ['23:00-06:00'],
    },
    personalization: {
      level: 'maximum',
      replaceFields: ['{firstName}', '{lastName}', '{company}', '{industry}', '{location}'],
      dynamicContent: true,
      personalizedOpening: true,
    },
    filtering: {
      minDataQuality: 'C',
      requiredFields: ['email'],
      excludeTags: ['bounced'],
      includeTags: [],
      countries: [],
      minSendIntervalDays: 7,
    },
    abTesting: {
      enabled: true,
      testGroupPercentage: 30,
      testElements: ['subject', 'content', 'timing'],
      optimizationGoal: 'conversion',
      testDurationHours: 72,
    },
    monitoring: {
      realtimeMonitoring: true,
      performanceThresholds: {
        minOpenRate: 0.25,
        minClickRate: 0.10,
        maxBounceRate: 0.10,
        maxUnsubscribeRate: 0.03,
      },
      autoPause: false,
      autoOptimize: true,
    },
    compliance: {
      gdprCompliant: true,
      includeUnsubscribe: true,
      unsubscribeMechanism: 'link',
      frequencyLimit: 'aggressive',
      blacklistCheck: true,
    },
    priority: 3,
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  'european-freight': {
    id: 'european-freight',
    name: '欧洲货代专用策略',
    description: '针对欧洲货运代理行业优化的发送策略',
    enabled: true,
    batching: {
      batchSize: 40,
      delayBetweenBatches: 90,
      maxDailySends: 200,
      adaptiveBatching: true,
    },
    timing: {
      enabled: true,
      optimalSendTime: '10:00',
      sendOnWeekdays: true,
      sendOnWeekends: false,
      timezoneAware: true,
      avoidHours: ['22:00-08:00', '13:00-14:00'],
    },
    personalization: {
      level: 'advanced',
      replaceFields: ['{firstName}', '{company}', '{country}', '{services}'],
      dynamicContent: true,
      personalizedOpening: true,
    },
    filtering: {
      minDataQuality: 'B',
      requiredFields: ['email', 'company', 'country'],
      excludeTags: ['bounced', 'unsubscribed'],
      includeTags: ['freight-forwarding', 'logistics', 'europe'],
      countries: ['DE', 'FR', 'NL', 'UK', 'BE', 'IT', 'ES'],
      minSendIntervalDays: 21,
    },
    abTesting: {
      enabled: true,
      testGroupPercentage: 15,
      testElements: ['subject', 'content'],
      optimizationGoal: 'reply-rate',
      testDurationHours: 24,
    },
    monitoring: {
      realtimeMonitoring: true,
      performanceThresholds: {
        minOpenRate: 0.18,
        minClickRate: 0.06,
        maxBounceRate: 0.06,
        maxUnsubscribeRate: 0.015,
      },
      autoPause: true,
      autoOptimize: true,
    },
    compliance: {
      gdprCompliant: true,
      includeUnsubscribe: true,
      unsubscribeMechanism: 'both',
      frequencyLimit: 'normal',
      blacklistCheck: true,
    },
    priority: 4,
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
};

/**
 * 策略管理器
 */
export class BulkSendStrategyManager {
  private strategies: Map<string, SendStrategy>;
  private activeStrategyId: string = 'balanced';
  
  constructor() {
    this.strategies = new Map();
    this.initializeStrategies();
  }
  
  /**
   * 初始化策略（加载预设）
   */
  private initializeStrategies(): void {
    Object.values(STRATEGY_PRESETS).forEach(strategy => {
      this.strategies.set(strategy.id, { ...strategy });
    });
  }
  
  /**
   * 获取所有策略
   */
  getAllStrategies(): SendStrategy[] {
    return Array.from(this.strategies.values()).sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * 获取策略
   */
  getStrategy(id: string): SendStrategy | undefined {
    return this.strategies.get(id);
  }
  
  /**
   * 获取当前活动策略
   */
  getActiveStrategy(): SendStrategy {
    return this.strategies.get(this.activeStrategyId) || STRATEGY_PRESETS.balanced;
  }
  
  /**
   * 设置活动策略
   */
  setActiveStrategy(id: string): boolean {
    if (this.strategies.has(id)) {
      this.activeStrategyId = id;
      return true;
    }
    return false;
  }
  
  /**
   * 创建或更新策略
   */
  saveStrategy(strategy: SendStrategy): void {
    const now = new Date().toISOString();
    const existing = this.strategies.get(strategy.id);
    
    if (existing) {
      strategy.lastModified = now;
    } else {
      strategy.createdAt = now;
      strategy.lastModified = now;
    }
    
    this.strategies.set(strategy.id, strategy);
  }
  
  /**
   * 删除策略
   */
  deleteStrategy(id: string): boolean {
    // 不允许删除预设策略
    if (id in STRATEGY_PRESETS) {
      return false;
    }
    return this.strategies.delete(id);
  }
  
  /**
   * 克隆策略
   */
  cloneStrategy(sourceId: string, newId: string, newName: string): SendStrategy | null {
    const source = this.strategies.get(sourceId);
    if (!source) return null;
    
    const cloned: SendStrategy = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: newName,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    
    this.strategies.set(newId, cloned);
    return cloned;
  }
  
  /**
   * 应用策略到批量发送任务
   */
  applyStrategyToJob(job: any, strategyId?: string): any {
    const strategy = strategyId ? this.getStrategy(strategyId) : this.getActiveStrategy();
    if (!strategy) return job;
    
    const updatedJob = { ...job };
    
    // 应用分批配置
    if (updatedJob.batchConfig) {
      updatedJob.batchConfig.batchSize = strategy.batching.batchSize;
      updatedJob.batchConfig.delayBetweenBatches = strategy.batching.delayBetweenBatches;
      updatedJob.batchConfig.maxDailySends = strategy.batching.maxDailySends;
      updatedJob.batchConfig.adaptiveBatching = strategy.batching.adaptiveBatching;
    }
    
    // 应用时间配置
    if (updatedJob.scheduleConfig) {
      updatedJob.scheduleConfig.optimalSendTime = strategy.timing.optimalSendTime;
      updatedJob.scheduleConfig.timezoneAware = strategy.timing.timezoneAware;
      updatedJob.scheduleConfig.avoidHours = strategy.timing.avoidHours;
      updatedJob.scheduleConfig.sendOnWeekdays = strategy.timing.sendOnWeekdays;
      updatedJob.scheduleConfig.sendOnWeekends = strategy.timing.sendOnWeekends;
    }
    
    // 应用个性化配置
    updatedJob.personalizationLevel = strategy.personalization.level;
    updatedJob.replaceFields = strategy.personalization.replaceFields;
    updatedJob.dynamicContent = strategy.personalization.dynamicContent;
    updatedJob.personalizedOpening = strategy.personalization.personalizedOpening;
    
    // 应用筛选配置
    if (updatedJob.selectionCriteria) {
      updatedJob.selectionCriteria.minDataQuality = strategy.filtering.minDataQuality;
      updatedJob.selectionCriteria.requiredFields = strategy.filtering.requiredFields;
      updatedJob.selectionCriteria.excludeTags = strategy.filtering.excludeTags;
      updatedJob.selectionCriteria.includeTags = strategy.filtering.includeTags;
      updatedJob.selectionCriteria.countries = strategy.filtering.countries;
      updatedJob.selectionCriteria.minSendIntervalDays = strategy.filtering.minSendIntervalDays;
    }
    
    // 应用A/B测试配置
    if (strategy.abTesting.enabled) {
      updatedJob.abTesting = {
        enabled: true,
        testGroupPercentage: strategy.abTesting.testGroupPercentage,
        testElements: strategy.abTesting.testElements,
        optimizationGoal: strategy.abTesting.optimizationGoal,
        testDurationHours: strategy.abTesting.testDurationHours,
      };
    }
    
    // 应用监控配置
    updatedJob.monitoring = strategy.monitoring;
    
    // 应用合规配置
    updatedJob.compliance = strategy.compliance;
    
    // 标记已应用策略
    updatedJob.appliedStrategy = strategy.id;
    updatedJob.strategyAppliedAt = new Date().toISOString();
    
    return updatedJob;
  }
  
  /**
   * 根据联系人列表优化策略
   */
  optimizeStrategyForContacts(strategy: SendStrategy, contacts: any[]): SendStrategy {
    const optimized = { ...strategy };
    const contactCount = contacts.length;
    
    // 根据联系人数量调整批次大小
    if (contactCount < 50) {
      optimized.batching.batchSize = Math.min(20, contactCount);
      optimized.batching.adaptiveBatching = false;
    } else if (contactCount > 500) {
      optimized.batching.batchSize = Math.min(100, Math.floor(contactCount / 10));
      optimized.batching.adaptiveBatching = true;
    }
    
    // 分析联系人地域分布
    const countryCounts: Record<string, number> = {};
    contacts.forEach(contact => {
      if (contact.country) {
        countryCounts[contact.country] = (countryCounts[contact.country] || 0) + 1;
      }
    });
    
    // 如果地域集中，调整发送时间
    const countries = Object.keys(countryCounts);
    if (countries.length === 1) {
      optimized.timing.timezoneAware = true;
      // 可以进一步调整optimalSendTime
    }
    
    // 分析数据质量
    const qualityCounts: Record<string, number> = { A: 0, B: 0, C: 0 };
    contacts.forEach(contact => {
      if (contact.dataQuality && qualityCounts[contact.dataQuality] !== undefined) {
        qualityCounts[contact.dataQuality]++;
      }
    });
    
    // 如果高质量联系人比例高，可以降低筛选门槛
    const highQualityRatio = (qualityCounts.A + qualityCounts.B) / contactCount;
    if (highQualityRatio > 0.7) {
      optimized.filtering.minDataQuality = 'B';
    } else if (highQualityRatio < 0.3) {
      optimized.filtering.minDataQuality = 'C';
    }
    
    return optimized;
  }
  
  /**
   * 生成策略建议
   */
  generateStrategyRecommendations(contacts: any[], goals: string[]): Array<{
    strategyId: string;
    name: string;
    description: string;
    confidence: number;
    expectedMetrics: Record<string, number | string>;
    recommendedChanges: string[];
  }> {
    const recommendations = [];
    const contactCount = contacts.length;
    
    // 根据联系人数量推荐策略
    if (contactCount <= 100) {
      recommendations.push({
        strategyId: 'conservative',
        name: '保守发送策略',
        description: '小规模发送，注重合规和关系建立',
        confidence: 0.85,
        expectedMetrics: {
          openRate: 0.18,
          replyRate: 0.06,
          conversionRate: 0.02,
          completionTime: `${Math.ceil(contactCount / 30) * 2}小时`,
        },
        recommendedChanges: ['增加个性化内容', '延长发送间隔'],
      });
    }
    
    if (contactCount > 100 && contactCount <= 500) {
      recommendations.push({
        strategyId: 'balanced',
        name: '平衡发送策略',
        description: '中等规模发送，平衡速度和效果',
        confidence: 0.9,
        expectedMetrics: {
          openRate: 0.22,
          replyRate: 0.08,
          conversionRate: 0.03,
          completionTime: `${Math.ceil(contactCount / 50)}小时`,
        },
        recommendedChanges: ['启用A/B测试', '调整发送时间'],
      });
    }
    
    if (contactCount > 500) {
      recommendations.push({
        strategyId: 'aggressive',
        name: '积极发送策略',
        description: '大规模发送，最大化覆盖范围',
        confidence: 0.75,
        expectedMetrics: {
          openRate: 0.15,
          replyRate: 0.05,
          conversionRate: 0.015,
          completionTime: `${Math.ceil(contactCount / 100) * 0.5}小时`,
        },
        recommendedChanges: ['增加批次大小', '降低筛选门槛'],
      });
    }
    
    // 如果目标是欧洲货代，推荐专用策略
    if (goals.includes('european-freight') || goals.includes('logistics')) {
      recommendations.push({
        strategyId: 'european-freight',
        name: '欧洲货代专用策略',
        description: '针对欧洲货运代理行业优化',
        confidence: 0.95,
        expectedMetrics: {
          openRate: 0.20,
          replyRate: 0.09,
          conversionRate: 0.04,
          completionTime: `${Math.ceil(contactCount / 40) * 1.5}小时`,
        },
        recommendedChanges: ['聚焦欧洲国家', '使用行业术语'],
      });
    }
    
    return recommendations;
  }
}

// 默认导出单例
export const bulkSendStrategyManager = new BulkSendStrategyManager();