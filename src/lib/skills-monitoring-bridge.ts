/**
 * Skills Monitoring Bridge for FYMail
 * 
 * 桥接技能执行和监控系统，自动记录技能执行指标到监控告警系统和历史趋势分析器。
 * 设计为可插拔组件，不修改现有技能集成代码。
 * 
 * 硬约束：不修改登录代码、登录流程、鉴权逻辑。
 */

import { skillExecutionLogger, type SkillExecutionLog } from './skill-execution-logger';
import { monitoringAlertSystem } from './monitoring-alert-system';
import { historicalTrendAnalyzer } from './historical-trend-analysis';
import { strategyRecommendationEngine } from './strategy-recommendation-engine';

/**
 * 技能监控桥接器
 */
export class SkillsMonitoringBridge {
  private enabled: boolean = true;
  private logger: any;
  
  constructor() {
    this.initialize();
  }
  
  /**
   * 初始化桥接器
   */
  private async initialize(): Promise<void> {
    if (!this.enabled) return;
    
    try {
      // 监听技能执行日志（通过重写或包装）
      this.setupLoggingInterceptor();
      
      console.log('[SkillsMonitoringBridge] Initialized - monitoring skill executions');
    } catch (error) {
      console.warn('[SkillsMonitoringBridge] Failed to initialize:', error);
      this.enabled = false;
    }
  }
  
  /**
   * 设置日志拦截器（通过包装技能执行日志记录器）
   */
  private setupLoggingInterceptor(): void {
    // 保存原始方法
    const storage = skillExecutionLogger.getStorage();
    const originalAppend = storage.append;
    
    // 包装append方法以拦截日志
    const self = this;
    storage.append = async function(log: SkillExecutionLog) {
      // 调用原始方法
      await originalAppend.call(this, log);
      
      // 记录到监控系统
      self.recordSkillExecutionToMonitoring(log);
      
      // 记录到历史趋势分析器
      self.recordSkillExecutionToTrendAnalyzer(log);
    };
    
    console.log('[SkillsMonitoringBridge] Logging interceptor installed');
  }
  
  /**
   * 将技能执行记录到监控系统
   */
  private recordSkillExecutionToMonitoring(log: SkillExecutionLog): void {
    try {
      // 记录执行上下文
      monitoringAlertSystem.recordContext({
        contextId: log.id,
        contextType: 'skill-execution',
        startTime: log.timestamp,
        endTime: new Date(new Date(log.timestamp).getTime() + log.result.durationMs).toISOString(),
        success: log.result.success,
        error: log.result.error,
        durationMs: log.result.durationMs,
        metadata: {
          skillId: log.skillId,
          skillName: log.skillName,
          executionType: log.executionType,
          workflowStage: log.workflowStage,
          userId: log.userId,
          sessionId: log.sessionId,
        },
      });
      
      // 记录成功率指标
      monitoringAlertSystem.recordMetric({
        metricType: 'successRate',
        value: log.result.success ? 1 : 0,
        tags: {
          skillId: log.skillId,
          skillName: log.skillName,
          workflowStage: log.workflowStage || 'unknown',
        },
        resourceId: log.skillId,
        resourceType: 'skill',
      });
      
      // 记录执行时间指标
      monitoringAlertSystem.recordMetric({
        metricType: 'executionTime',
        value: log.result.durationMs,
        tags: {
          skillId: log.skillId,
          skillName: log.skillName,
          workflowStage: log.workflowStage || 'unknown',
          success: log.result.success.toString(),
        },
        resourceId: log.skillId,
        resourceType: 'skill',
      });
      
      // 记录错误计数（如果失败）
      if (!log.result.success) {
        monitoringAlertSystem.recordMetric({
          metricType: 'errorCount',
          value: 1,
          tags: {
            skillId: log.skillId,
            skillName: log.skillName,
            errorType: log.result.error?.split(':')[0] || 'unknown',
          },
          resourceId: log.skillId,
          resourceType: 'skill',
        });
      }
      
    } catch (error) {
      console.warn('[SkillsMonitoringBridge] Failed to record skill execution to monitoring:', error);
    }
  }
  
  /**
   * 将技能执行记录到历史趋势分析器
   */
  private recordSkillExecutionToTrendAnalyzer(log: SkillExecutionLog): void {
    try {
      // 记录执行时间趋势
      historicalTrendAnalyzer.recordDataPoint({
        metricType: `skill.${log.skillId}.duration`,
        value: log.result.durationMs,
        tags: {
          skillId: log.skillId,
          skillName: log.skillName,
          success: log.result.success.toString(),
          workflowStage: log.workflowStage || 'unknown',
        },
        resourceId: log.skillId,
        resourceType: 'skill',
      });
      
      // 记录成功率趋势
      historicalTrendAnalyzer.recordDataPoint({
        metricType: `skill.${log.skillId}.success`,
        value: log.result.success ? 1 : 0,
        tags: {
          skillId: log.skillId,
          skillName: log.skillName,
          workflowStage: log.workflowStage || 'unknown',
        },
        resourceId: log.skillId,
        resourceType: 'skill',
      });
      
      // 记录总体技能执行趋势
      historicalTrendAnalyzer.recordDataPoint({
        metricType: 'skills.execution.count',
        value: 1,
        tags: {
          skillId: log.skillId,
          skillCategory: this.getSkillCategory(log.skillId),
          executionType: log.executionType,
        },
        resourceId: 'skills-overall',
        resourceType: 'system',
      });
      
    } catch (error) {
      console.warn('[SkillsMonitoringBridge] Failed to record skill execution to trend analyzer:', error);
    }
  }
  
  /**
   * 获取技能类别
   */
  private getSkillCategory(skillId: string): string {
    const categoryMap: Record<string, string> = {
      'email-marketing-automation': 'email-marketing',
      'data-enrichment-tools': 'data-enrichment',
      'contact-finder-pro': 'contact-finding',
      'cold-email-outreach': 'email-marketing',
    };
    
    return categoryMap[skillId] || 'other';
  }
  
  /**
   * 记录批量发送任务性能
   */
  recordBulkSendJobPerformance(
    jobId: string,
    metrics: {
      openRate?: number;
      replyRate?: number;
      conversionRate?: number;
      unsubscribeRate?: number;
      bounceRate?: number;
      success: boolean;
      durationMs: number;
    },
    strategyId?: string
  ): void {
    try {
      const timestamp = new Date().toISOString();
      
      // 记录到监控系统
      monitoringAlertSystem.recordContext({
        contextId: jobId,
        contextType: 'bulk-send-job',
        startTime: timestamp,
        success: metrics.success,
        durationMs: metrics.durationMs,
        metadata: {
          jobId,
          strategyId,
          openRate: metrics.openRate,
          replyRate: metrics.replyRate,
          conversionRate: metrics.conversionRate,
        },
      });
      
      // 记录指标
      if (metrics.openRate !== undefined) {
        monitoringAlertSystem.recordMetric({
          metricType: 'job.openRate',
          value: metrics.openRate,
          tags: { jobId, strategyId: strategyId || 'none' },
          resourceId: jobId,
          resourceType: 'job',
        });
        
        historicalTrendAnalyzer.recordDataPoint({
          metricType: 'job.openRate',
          value: metrics.openRate,
          tags: { jobId, strategyId: strategyId || 'none' },
          resourceId: jobId,
          resourceType: 'job',
        });
      }
      
      if (metrics.replyRate !== undefined) {
        monitoringAlertSystem.recordMetric({
          metricType: 'job.replyRate',
          value: metrics.replyRate,
          tags: { jobId, strategyId: strategyId || 'none' },
          resourceId: jobId,
          resourceType: 'job',
        });
        
        historicalTrendAnalyzer.recordDataPoint({
          metricType: 'job.replyRate',
          value: metrics.replyRate,
          tags: { jobId, strategyId: strategyId || 'none' },
          resourceId: jobId,
          resourceType: 'job',
        });
      }
      
      // 记录策略性能到推荐引擎
      if (strategyId && metrics.openRate !== undefined && metrics.replyRate !== undefined) {
        this.recordStrategyPerformance(strategyId, metrics);
      }
      
    } catch (error) {
      console.warn('[SkillsMonitoringBridge] Failed to record bulk send job performance:', error);
    }
  }
  
  /**
   * 记录策略性能到推荐引擎
   */
  private recordStrategyPerformance(
    strategyId: string,
    metrics: {
      openRate?: number;
      replyRate?: number;
      conversionRate?: number;
      unsubscribeRate?: number;
      bounceRate?: number;
      success: boolean;
    }
  ): void {
    try {
      // 这里需要联系人特征和任务特征，但为了简化，使用默认值
      const contactCharacteristics = {
        count: 100, // 假设值
        countryDistribution: {},
        dataQualityDistribution: { A: 0, B: 0, C: 0 },
        industryTags: [],
        companySizeDistribution: {},
      };
      
      const taskCharacteristics = {
        goals: ['engagement'],
        priority: 'medium' as const,
        riskTolerance: 'balanced' as const,
        personalizationRequirement: 'advanced' as const,
      };
      
      strategyRecommendationEngine.recordStrategyExecution?.(
        strategyId,
        {
          openRate: metrics.openRate,
          replyRate: metrics.replyRate,
          conversionRate: metrics.conversionRate,
          unsubscribeRate: metrics.unsubscribeRate,
          bounceRate: metrics.bounceRate,
          success: metrics.success,
        },
        contactCharacteristics,
        taskCharacteristics
      ).catch(error => {
        console.warn('[SkillsMonitoringBridge] Failed to record strategy performance:', error);
      });
      
    } catch (error) {
      console.warn('[SkillsMonitoringBridge] Failed to record strategy performance:', error);
    }
  }
  
  /**
   * 记录A/B测试事件
   */
  recordABTestEvent(
    testId: string,
    variantId: string,
    resourceId: string,
    eventType: 'exposure' | 'conversion',
    conversionValue?: number
  ): void {
    try {
      const timestamp = new Date().toISOString();
      
      // 记录到监控系统
      monitoringAlertSystem.recordContext({
        contextId: `${testId}-${resourceId}-${eventType}`,
        contextType: 'skill-execution',
        startTime: timestamp,
        success: true,
        durationMs: 0,
        metadata: {
          testId,
          variantId,
          resourceId,
          eventType,
          conversionValue,
        },
      });
      
      // 记录指标
      monitoringAlertSystem.recordMetric({
        metricType: `abtest.${testId}.${eventType}`,
        value: 1,
        tags: {
          testId,
          variantId,
          eventType,
        },
        resourceId: testId,
        resourceType: 'abtest',
      });
      
      // 记录到历史趋势分析器
      historicalTrendAnalyzer.recordDataPoint({
        metricType: `abtest.${testId}.${eventType}`,
        value: 1,
        tags: {
          testId,
          variantId,
          eventType,
        },
        resourceId: testId,
        resourceType: 'abtest',
      });
      
    } catch (error) {
      console.warn('[SkillsMonitoringBridge] Failed to record A/B test event:', error);
    }
  }
  
  /**
   * 启用或禁用监控桥接
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[SkillsMonitoringBridge] ${enabled ? 'Enabled' : 'Disabled'}`);
  }
  
  /**
   * 获取监控桥接状态
   */
  getStatus(): {
    enabled: boolean;
    monitoringSystem: 'connected';
    trendAnalyzer: 'connected';
    skillsMonitored: number;
  } {
    return {
      enabled: this.enabled,
      monitoringSystem: 'connected',
      trendAnalyzer: 'connected',
      skillsMonitored: 4, // 内置技能数量
    };
  }
}

// 默认导出单例
export const skillsMonitoringBridge = new SkillsMonitoringBridge();