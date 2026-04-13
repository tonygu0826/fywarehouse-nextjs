/**
 * Skills System Configuration
 * 
 * 技能系统配置文件，支持环境变量和默认配置。
 * 为生产环境提供可配置的选项。
 */

export interface SkillsSystemConfig {
  // 技能发现与注册
  skills: {
    // 技能目录路径
    skillsDirectory: string;
    // 自动发现技能
    autoDiscover: boolean;
    // 发现间隔（分钟）
    discoveryIntervalMinutes: number;
    // 最大技能数
    maxSkills: number;
  };
  
  // 执行与性能
  execution: {
    // 并发执行数
    concurrency: number;
    // 执行超时（毫秒）
    timeoutMs: number;
    // 启用性能监控
    enablePerformanceMonitoring: boolean;
    // 性能采样率（0-1）
    performanceSamplingRate: number;
  };
  
  // 联系人增强管道
  enrichment: {
    // 启用联系人增强
    enabled: boolean;
    // 最大重试次数
    maxRetries: number;
    // 重试延迟（毫秒）
    retryDelayMs: number;
    // 缓存TTL（秒）
    cacheTtlSeconds: number;
    // 启用缓存
    enableCache: boolean;
  };
  
  // 批量发送策略
  bulkSend: {
    // 启用策略推荐
    enableStrategyRecommendations: boolean;
    // 推荐缓存时间（秒）
    recommendationCacheTtlSeconds: number;
    // 历史性能数据保留天数
    historicalDataRetentionDays: number;
  };
  
  // 监控告警
  monitoring: {
    // 启用监控
    enabled: boolean;
    // 告警邮件接收者
    alertEmailRecipient: string;
    // 告警静默时间（分钟）
    alertCooldownMinutes: number;
    // 启用性能阈值告警
    enablePerformanceAlerts: boolean;
  };
  
  // A/B测试
  abTesting: {
    // 启用A/B测试
    enabled: boolean;
    // 自动分配变体
    autoAssignVariants: boolean;
    // 结果跟踪窗口（小时）
    trackingWindowHours: number;
    // 最小样本量
    minimumSampleSize: number;
  };
  
  // 健康检查
  healthCheck: {
    // 启用健康检查端点
    enableHealthCheckEndpoint: boolean;
    // 健康检查超时（毫秒）
    healthCheckTimeoutMs: number;
    // 依赖检查
    checkDependencies: boolean;
  };
  
  // 日志
  logging: {
    // 日志级别
    level: 'debug' | 'info' | 'warn' | 'error';
    // 启用结构化日志
    structuredLogging: boolean;
    // 日志文件路径（可选）
    logFilePath?: string;
  };
}

/**
 * 从环境变量加载配置
 */
export function loadSkillsConfig(): SkillsSystemConfig {
  return {
    skills: {
      skillsDirectory: process.env.SKILLS_DIRECTORY || '/home/ubuntu/.openclaw/workspace/skills',
      autoDiscover: process.env.SKILLS_AUTO_DISCOVER !== 'false', // 默认true
      discoveryIntervalMinutes: parseInt(process.env.SKILLS_DISCOVERY_INTERVAL_MINUTES || '60'),
      maxSkills: parseInt(process.env.SKILLS_MAX_SKILLS || '50'),
    },
    execution: {
      concurrency: parseInt(process.env.SKILLS_CONCURRENCY || '3'),
      timeoutMs: parseInt(process.env.SKILLS_TIMEOUT_MS || '30000'),
      enablePerformanceMonitoring: process.env.SKILLS_PERFORMANCE_MONITORING !== 'false',
      performanceSamplingRate: parseFloat(process.env.SKILLS_PERFORMANCE_SAMPLING_RATE || '0.1'),
    },
    enrichment: {
      enabled: process.env.ENRICHMENT_ENABLED !== 'false',
      maxRetries: parseInt(process.env.ENRICHMENT_MAX_RETRIES || '3'),
      retryDelayMs: parseInt(process.env.ENRICHMENT_RETRY_DELAY_MS || '1000'),
      cacheTtlSeconds: parseInt(process.env.ENRICHMENT_CACHE_TTL_SECONDS || '3600'),
      enableCache: process.env.ENRICHMENT_CACHE_ENABLED !== 'false',
    },
    bulkSend: {
      enableStrategyRecommendations: process.env.STRATEGY_RECOMMENDATIONS_ENABLED !== 'false',
      recommendationCacheTtlSeconds: parseInt(process.env.STRATEGY_RECOMMENDATIONS_CACHE_TTL || '300'),
      historicalDataRetentionDays: parseInt(process.env.STRATEGY_HISTORICAL_DATA_RETENTION_DAYS || '90'),
    },
    monitoring: {
      enabled: process.env.MONITORING_ENABLED !== 'false',
      alertEmailRecipient: process.env.ALERT_EMAIL_RECIPIENT || process.env.FYMAIL_ADMIN_EMAIL || '',
      alertCooldownMinutes: parseInt(process.env.ALERT_COOLDOWN_MINUTES || '30'),
      enablePerformanceAlerts: process.env.PERFORMANCE_ALERTS_ENABLED === 'true',
    },
    abTesting: {
      enabled: process.env.AB_TESTING_ENABLED !== 'false',
      autoAssignVariants: process.env.AB_TESTING_AUTO_ASSIGN !== 'false',
      trackingWindowHours: parseInt(process.env.AB_TESTING_TRACKING_WINDOW_HOURS || '72'),
      minimumSampleSize: parseInt(process.env.AB_TESTING_MINIMUM_SAMPLE_SIZE || '100'),
    },
    healthCheck: {
      enableHealthCheckEndpoint: process.env.HEALTH_CHECK_ENABLED !== 'false',
      healthCheckTimeoutMs: parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS || '5000'),
      checkDependencies: process.env.HEALTH_CHECK_DEPENDENCIES === 'true',
    },
    logging: {
      level: (process.env.SKILLS_LOG_LEVEL as any) || 'info',
      structuredLogging: process.env.SKILLS_STRUCTURED_LOGGING === 'true',
      logFilePath: process.env.SKILLS_LOG_FILE_PATH,
    },
  };
}

/**
 * 验证配置
 */
export function validateSkillsConfig(config: SkillsSystemConfig): string[] {
  const errors: string[] = [];
  
  if (config.skills.maxSkills < 1 || config.skills.maxSkills > 1000) {
    errors.push('SKILLS_MAX_SKILLS must be between 1 and 1000');
  }
  
  if (config.execution.concurrency < 1 || config.execution.concurrency > 20) {
    errors.push('SKILLS_CONCURRENCY must be between 1 and 20');
  }
  
  if (config.execution.timeoutMs < 1000 || config.execution.timeoutMs > 300000) {
    errors.push('SKILLS_TIMEOUT_MS must be between 1000 and 300000 (5 minutes)');
  }
  
  if (config.execution.performanceSamplingRate < 0 || config.execution.performanceSamplingRate > 1) {
    errors.push('SKILLS_PERFORMANCE_SAMPLING_RATE must be between 0 and 1');
  }
  
  if (config.monitoring.enabled && !config.monitoring.alertEmailRecipient) {
    errors.push('ALERT_EMAIL_RECIPIENT is required when monitoring is enabled');
  }
  
  return errors;
}

/**
 * 默认配置
 */
export const defaultSkillsConfig: SkillsSystemConfig = loadSkillsConfig();

// 导出单例配置
export const skillsConfig = defaultSkillsConfig;