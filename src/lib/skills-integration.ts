/**
 * Skills Integration for FYMail
 * 
 * 技能集成层，将技能能力注入到FYMail工作流中。
 * 最小侵入式集成：通过包装函数和钩子方式，不改变核心业务逻辑。
 */

import { skillsRegistry, skillExecutor, type SkillContext, type WorkflowStage } from './skills-registry';
import type { FymailContact, ContactInput } from './fymail';
import { contactEnrichmentPipeline } from './contact-enrichment-pipeline';
import { bulkSendStrategyManager } from './bulk-send-strategy';
import { skillsMonitoringBridge } from './skills-monitoring-bridge';

/**
 * 联系人处理上下文
 */
export interface ContactProcessingContext {
  /** 原始联系人输入 */
  input: ContactInput;
  /** 验证后的联系人数据 */
  validatedContact: Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'>;
  /** 现有联系人（更新时） */
  existingContact?: FymailContact;
  /** 操作类型 */
  operation: 'create' | 'update' | 'import' | 'enrich';
  /** 用户ID（如有） */
  userId?: string;
}

/**
 * 模板处理上下文
 */
export interface TemplateProcessingContext {
  /** 模板输入 */
  input: any;
  /** 验证后的模板数据 */
  validatedTemplate: any;
  /** 现有模板（更新时） */
  existingTemplate?: any;
  /** 操作类型 */
  operation: 'create' | 'update' | 'clone';
  /** 用户ID（如有） */
  userId?: string;
}

/**
 * 批量发送任务处理上下文
 */
export interface JobProcessingContext {
  /** 任务输入 */
  input: any;
  /** 验证后的任务数据 */
  validatedJob: any;
  /** 操作类型 */
  operation: 'create' | 'schedule' | 'execute' | 'monitor';
  /** 用户ID（如有） */
  userId?: string;
}

/**
 * 技能集成管理器
 */
export class SkillsIntegrationManager {
  /**
   * 处理联系人创建/更新前的技能增强
   * 使用强化后的enrichment pipeline提供更真实的执行链路
   */
  async processContactBeforeSave(
    context: ContactProcessingContext
  ): Promise<{
    enrichedContact: Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'>;
    skillResults: any[];
  }> {
    const skillContext: SkillContext = {
      workflowStage: context.operation === 'create' ? 'contact-acquisition' : 'contact-enrichment',
      contact: context.validatedContact,
      userConfig: {},
    };
    
    // 执行联系人验证阶段技能
    const validationResults = await skillExecutor.executeForWorkflowStage(
      'contact-validation',
      skillContext
    );
    
    // 执行联系人增强阶段技能
    const enrichmentResults = await skillExecutor.executeForWorkflowStage(
      'contact-enrichment',
      skillContext
    );
    
    // 执行数据质量评分阶段技能
    const scoringResults = await skillExecutor.executeForWorkflowStage(
      'data-quality-scoring',
      skillContext
    );
    
    const allResults = [...validationResults, ...enrichmentResults, ...scoringResults];
    
    // 应用技能增强到联系人数据
    let enrichedContact = { ...context.validatedContact };
    
    for (const result of allResults) {
      if (result.success && result.data) {
        enrichedContact = this.applySkillResultsToContact(enrichedContact, result.data);
      }
    }
    
    // 第四阶段增强：使用强化后的enrichment pipeline
    try {
      const pipelineResult = await contactEnrichmentPipeline.executePipeline(
        enrichedContact,
        context.userId
      );
      
      // 合并pipeline结果
      enrichedContact = { ...enrichedContact, ...pipelineResult.enrichedContact };
      
      // 记录pipeline步骤结果到skillResults
      const pipelineSkillResults = pipelineResult.stepResults.map((step, index) => ({
        skillId: `enrichment-pipeline-step-${index}`,
        skillName: `Step ${index}`,
        success: step.success,
        data: step.output,
        message: step.success ? `Step completed: ${index}` : `Step failed: ${index}`,
        error: step.error,
        durationMs: step.durationMs,
      }));
      
      allResults.push(...pipelineSkillResults);
      
      // 使用pipeline的整体质量评分
      enrichedContact.dataQuality = pipelineResult.overallQuality;
      
      console.log(`[SkillsIntegration] Enrichment pipeline executed: ${pipelineResult.stepResults.length} steps, quality: ${pipelineResult.overallQuality}, duration: ${pipelineResult.totalDurationMs}ms`);
      
    } catch (pipelineError) {
      console.warn('[SkillsIntegration] Enrichment pipeline failed, falling back to basic enrichment:', pipelineError);
      
      // 回退到基本数据质量计算
      enrichedContact.dataQuality = this.calculateDataQuality(enrichedContact);
    }
    
    // 确保数据质量字段存在
    if (!enrichedContact.dataQuality) {
      enrichedContact.dataQuality = this.calculateDataQuality(enrichedContact);
    }
    
    return {
      enrichedContact,
      skillResults: allResults,
    };
  }
  
  /**
   * 应用技能结果到联系人
   */
  private applySkillResultsToContact(
    contact: Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'>,
    skillData: Record<string, any>
  ): Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'> {
    const updated = { ...contact };
    
    // 应用数据增强工具结果
    if (skillData.enrichedFields) {
      // 标记已增强的字段（可以存储在元数据中）
      updated.tags = [...new Set([...updated.tags, ...skillData.enrichedFields.map((f: string) => `enriched:${f}`)])];
    }
    
    if (skillData.qualityScore !== undefined) {
      // 如果技能提供了质量评分，更新数据质量等级
      const skillQuality = skillData.qualityScore;
      if (skillQuality >= 80) {
        updated.dataQuality = 'A';
      } else if (skillQuality >= 60) {
        updated.dataQuality = 'B';
      } else {
        updated.dataQuality = 'C';
      }
    }
    
    if (skillData.validationResults) {
      // 记录验证结果到备注
      const validationSummary = Object.entries(skillData.validationResults)
        .map(([field, result]: [string, any]) => `${field}: ${result.valid ? '✓' : '✗'}`)
        .join(', ');
      updated.notes = updated.notes ? `${updated.notes}\nValidation: ${validationSummary}` : `Validation: ${validationSummary}`;
    }
    
    if (skillData.enrichmentData) {
      // 应用增强数据到联系人字段
      const enrichment = skillData.enrichmentData;
      
      if (enrichment.companyInfo?.industry) {
        updated.tags = [...new Set([...updated.tags, `industry:${enrichment.companyInfo.industry}`])];
      }
      
      if (enrichment.companyInfo?.employeeCount) {
        updated.companySize = enrichment.companyInfo.employeeCount.toString();
      }
      
      if (enrichment.contactEnhancement?.department) {
        updated.tags = [...new Set([...updated.tags, `dept:${enrichment.contactEnhancement.department}`])];
      }
      
      if (enrichment.contactEnhancement?.seniority) {
        updated.tags = [...new Set([...updated.tags, `seniority:${enrichment.contactEnhancement.seniority}`])];
      }
      
      if (enrichment.geographicData?.timezone) {
        updated.tags = [...new Set([...updated.tags, `timezone:${enrichment.geographicData.timezone}`])];
      }
    }
    
    // 应用联系人查找专业版结果
    if (skillData.contactsFound) {
      // 记录查找结果到备注
      updated.notes = updated.notes ? `${updated.notes}\nFound ${skillData.contactsFound} contacts via Contact Finder Pro` : `Found ${skillData.contactsFound} contacts via Contact Finder Pro`;
    }
    
    if (skillData.confidenceScores) {
      // 计算平均置信度
      const avgConfidence = skillData.confidenceScores.reduce((a: number, b: number) => a + b, 0) / skillData.confidenceScores.length;
      updated.tags = [...new Set([...updated.tags, `confidence:${Math.round(avgConfidence)}`])];
    }
    
    // 应用冷邮件外展结果
    if (skillData.localizedTemplate) {
      updated.tags = [...new Set([...updated.tags, `template:${skillData.localizedTemplate}`])];
    }
    
    if (skillData.regionalInsights) {
      const insights = skillData.regionalInsights;
      if (insights.bestDay) {
        updated.tags = [...new Set([...updated.tags, `bestDay:${insights.bestDay}`])];
      }
      if (insights.bestTime) {
        updated.tags = [...new Set([...updated.tags, `bestTime:${insights.bestTime}`])];
      }
    }
    
    return updated;
  }
  
  /**
   * 计算联系人数据质量评分
   */
  private calculateDataQuality(
    contact: Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'>
  ): 'A' | 'B' | 'C' {
    const score = this.contactQualityScore(contact);
    
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    return 'C';
  }
  
  /**
   * 计算联系人质量分数（0-100）
   */
  private contactQualityScore(
    contact: Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'>
  ): number {
    let score = 0;
    
    // 基础字段完整性（40分）
    if (contact.firstName && contact.lastName) score += 20;
    if (contact.email) score += 10;
    if (contact.company) score += 10;
    
    // 欧洲货代数据字段（30分）
    if (contact.country) score += 10;
    if (contact.companySize) score += 5;
    if (contact.services && contact.services.length > 0) score += 10;
    if (contact.specialization && contact.specialization.length > 0) score += 5;
    
    // 数据质量指标（30分）
    if (contact.dataQuality === 'A') score += 30;
    else if (contact.dataQuality === 'B') score += 20;
    else if (contact.dataQuality === 'C') score += 10;
    
    return Math.min(100, score);
  }
  
  /**
   * 处理模板创建/更新前的技能增强
   */
  async processTemplateBeforeSave(
    context: TemplateProcessingContext
  ): Promise<{
    enrichedTemplate: any;
    skillResults: any[];
  }> {
    const skillContext: SkillContext = {
      workflowStage: 'template-design',
      template: context.validatedTemplate,
      userConfig: {},
    };
    
    // 执行模板设计阶段技能
    const designResults = await skillExecutor.executeForWorkflowStage(
      'template-design',
      skillContext
    );
    
    const allResults = [...designResults];
    
    // 应用技能增强到模板数据
    let enrichedTemplate = { ...context.validatedTemplate };
    
    for (const result of allResults) {
      if (result.success && result.data) {
        enrichedTemplate = this.applySkillResultsToTemplate(enrichedTemplate, result.data);
      }
    }
    
    return {
      enrichedTemplate,
      skillResults: allResults,
    };
  }
  
  /**
   * 应用技能结果到模板
   */
  private applySkillResultsToTemplate(
    template: any,
    skillData: Record<string, any>
  ): any {
    const updated = { ...template };
    
    // 应用邮件营销自动化结果
    if (skillData.suggestedTemplate) {
      // 记录建议的模板
    }
    
    if (skillData.sendStrategy) {
      // 记录发送策略建议
    }
    
    // 应用冷邮件外展结果
    if (skillData.localizedTemplate) {
      // 应用本地化建议
    }
    
    if (skillData.regionalInsights) {
      // 记录区域洞察
    }
    
    return updated;
  }
  
  /**
   * 处理批量发送任务创建/调度前的技能优化
   */
  async processJobBeforeSave(
    context: JobProcessingContext
  ): Promise<{
    optimizedJob: any;
    skillResults: any[];
  }> {
    const skillContext: SkillContext = {
      workflowStage: context.operation === 'create' ? 'campaign-planning' : 'bulk-send-scheduling',
      job: context.validatedJob,
      userConfig: {},
    };
    
    let stage: WorkflowStage = 'campaign-planning';
    if (context.operation === 'schedule' || context.operation === 'execute') {
      stage = 'bulk-send-scheduling';
    }
    
    // 执行相应阶段技能
    const planningResults = await skillExecutor.executeForWorkflowStage(
      stage,
      skillContext
    );
    
    const allResults = [...planningResults];
    
    // 应用技能优化到任务数据
    let optimizedJob = { ...context.validatedJob };
    
    for (const result of allResults) {
      if (result.success && result.data) {
        optimizedJob = this.applySkillResultsToJob(optimizedJob, result.data);
      }
    }
    
    // 应用批量发送策略（如果指定了strategyId）
    if (context.input && context.input.strategyId) {
      try {
        optimizedJob = bulkSendStrategyManager.applyStrategyToJob(optimizedJob, context.input.strategyId);
        console.log(`[SkillsIntegration] Applied strategy ${context.input.strategyId} to job ${optimizedJob.id}`);
      } catch (error) {
        console.warn(`[SkillsIntegration] Failed to apply strategy ${context.input.strategyId}:`, error);
        // 继续执行，不中断流程
      }
    }
    
    return {
      optimizedJob,
      skillResults: allResults,
    };
  }
  
  /**
   * 应用技能结果到任务
   */
  private applySkillResultsToJob(
    job: any,
    skillData: Record<string, any>
  ): any {
    const updated = { ...job };
    
    // 应用邮件营销自动化结果
    if (skillData.sendStrategy) {
      const strategy = skillData.sendStrategy;
      
      // 优化发送策略
      if (strategy.batchSize && updated.batchConfig) {
        updated.batchConfig.batchSize = Math.max(10, Math.min(strategy.batchSize, 200)); // 限制范围
      }
      
      if (strategy.delayBetweenBatches && updated.scheduleConfig) {
        updated.scheduleConfig.delayBetweenBatches = Math.max(15, Math.min(strategy.delayBetweenBatches, 120)); // 15-120分钟
      }
      
      if (strategy.optimalSendTime && updated.scheduleConfig) {
        // 解析最佳发送时间，存储在配置中
        updated.scheduleConfig.optimalSendTime = strategy.optimalSendTime;
      }
      
      // 应用预测指标
      if (strategy.predictedMetrics) {
        updated.predictedMetrics = strategy.predictedMetrics;
      }
      
      // 应用个性化级别
      if (strategy.personalizationLevel) {
        updated.personalizationLevel = strategy.personalizationLevel;
      }
    }
    
    // 应用冷邮件外展结果
    if (skillData.regionalInsights) {
      const insights = skillData.regionalInsights;
      
      // 优化发送时间
      if (insights.bestDay && updated.scheduleConfig) {
        updated.scheduleConfig.bestDay = insights.bestDay;
      }
      
      if (insights.bestTime && updated.scheduleConfig) {
        updated.scheduleConfig.bestTime = insights.bestTime;
      }
      
      // 记录区域特定洞察
      if (insights.expectedReplyRate) {
        updated.expectedReplyRate = insights.expectedReplyRate;
      }
      
      if (insights.culturalNotes) {
        updated.culturalNotes = insights.culturalNotes;
      }
    }
    
    // 应用数据增强工具结果（数据质量筛选）
    if (skillData.qualityScore !== undefined) {
      // 根据数据质量优化收件人选择
      const minQuality = skillData.qualityScore >= 80 ? 'A' : skillData.qualityScore >= 60 ? 'B' : 'C';
      if (updated.selectionCriteria) {
        updated.selectionCriteria.minDataQuality = minQuality;
      }
    }
    
    // 应用联系人查找结果（扩展收件人列表）
    if (skillData.contactsFound && skillData.contacts) {
      // 注意：这里不直接修改收件人列表，因为任务已创建
      // 可以记录建议的新联系人数量
      updated.suggestedAdditionalContacts = skillData.contactsFound;
    }
    
    return updated;
  }
  
  /**
   * 监控发送任务性能并应用优化
   */
  async monitorAndOptimizeJob(
    jobId: string,
    performanceData: Record<string, any>
  ): Promise<{
    optimizations: any[];
    skillResults: any[];
  }> {
    const skillContext: SkillContext = {
      workflowStage: 'performance-monitoring',
      job: { id: jobId, ...performanceData },
      userConfig: {},
    };
    
    // 执行性能监控阶段技能
    const monitoringResults = await skillExecutor.executeForWorkflowStage(
      'performance-monitoring',
      skillContext
    );
    
    const allResults = [...monitoringResults];
    
    // 提取优化建议
    const optimizations: any[] = [];
    
    for (const result of allResults) {
      if (result.success && result.data) {
        optimizations.push({
          skillId: result.data.skillId || 'unknown',
          suggestion: result.data.optimization || result.data.suggestion,
          confidence: result.data.confidence || 0.5,
        });
      }
    }
    
    // 记录性能指标到监控系统
    try {
      skillsMonitoringBridge.recordBulkSendJobPerformance(
        jobId,
        {
          openRate: performanceData.openRate,
          replyRate: performanceData.replyRate,
          conversionRate: performanceData.conversionRate,
          unsubscribeRate: performanceData.unsubscribeRate,
          bounceRate: performanceData.bounceRate,
          success: performanceData.success !== false,
          durationMs: performanceData.durationMs || 0,
        },
        performanceData.strategyId
      );
    } catch (error) {
      console.warn('[SkillsIntegration] Failed to record job performance to monitoring:', error);
    }
    
    return {
      optimizations,
      skillResults: allResults,
    };
  }
}

/**
 * 技能集成钩子 - 包装现有FYMail函数
 */
export class SkillsIntegrationHooks {
  private manager: SkillsIntegrationManager;
  
  constructor() {
    this.manager = new SkillsIntegrationManager();
  }
  
  /**
   * 包装createContact函数
   */
  async createContactWithSkills(
    originalCreateFn: (input: ContactInput) => Promise<any>,
    input: ContactInput,
    userId?: string
  ): Promise<any> {
    // 先调用原始验证逻辑（通过模拟验证）
    // 实际实现中需要提取验证逻辑
    const validatedContact = this.mockValidateContact(input);
    
    const context: ContactProcessingContext = {
      input,
      validatedContact,
      operation: 'create',
      userId,
    };
    
    // 应用技能增强
    const { enrichedContact, skillResults } = await this.manager.processContactBeforeSave(context);
    
    // 记录技能执行结果
    this.logSkillResults('createContact', skillResults);
    
    // 使用增强后的数据调用原始创建函数
    // 注意：需要将enrichedContact转换回ContactInput格式
    const enhancedInput: ContactInput = {
      ...input,
      country: enrichedContact.country,
      companySize: enrichedContact.companySize,
      services: enrichedContact.services,
      specialization: enrichedContact.specialization,
      dataQuality: enrichedContact.dataQuality,
    };
    
    return originalCreateFn(enhancedInput);
  }
  
  /**
   * 包装updateContact函数
   */
  async updateContactWithSkills(
    originalUpdateFn: (id: string, input: ContactInput) => Promise<any>,
    id: string,
    input: ContactInput,
    existingContact: any,
    userId?: string
  ): Promise<any> {
    // 先调用原始验证逻辑（通过模拟验证）
    const validatedContact = this.mockValidateContact(input, existingContact);
    
    const context: ContactProcessingContext = {
      input,
      validatedContact,
      existingContact,
      operation: 'update',
      userId,
    };
    
    // 应用技能增强
    const { enrichedContact, skillResults } = await this.manager.processContactBeforeSave(context);
    
    // 记录技能执行结果
    this.logSkillResults('updateContact', skillResults);
    
    // 使用增强后的数据调用原始更新函数
    const enhancedInput: ContactInput = {
      ...input,
      country: enrichedContact.country || existingContact?.country,
      companySize: enrichedContact.companySize || existingContact?.companySize,
      services: enrichedContact.services || existingContact?.services,
      specialization: enrichedContact.specialization || existingContact?.specialization,
      dataQuality: enrichedContact.dataQuality || existingContact?.dataQuality,
    };
    
    return originalUpdateFn(id, enhancedInput);
  }
  
  /**
   * 模拟联系人验证（实际实现应使用fymail.ts中的validateContactInput）
   */
  private mockValidateContact(
    input: ContactInput,
    existingContact?: any
  ): Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'> {
    // 这是一个简化版本，实际实现应该导入并使用fymail.ts中的validateContactInput
    return {
      firstName: input.firstName || '',
      lastName: input.lastName || '',
      email: input.email || '',
      phone: input.phone || '',
      company: input.company || '',
      tags: Array.isArray(input.tags) ? input.tags : [],
      notes: input.notes || '',
      source: input.source || 'manual',
      status: input.status || 'active',
      emailSent: input.emailSent || false,
      firstSentAt: input.firstSentAt || null,
      lastSentAt: input.lastSentAt || null,
      sentCount: input.sentCount || 0,
      lastTemplateId: input.lastTemplateId || null,
      batchIds: input.batchIds || [],
      acquisitionSource: input.acquisitionSource || 'manual',
      acquisitionDate: input.acquisitionDate || new Date().toISOString(),
      country: input.country || '',
      companySize: input.companySize || '',
      services: input.services || [],
      specialization: input.specialization || [],
      dataQuality: input.dataQuality || 'C',
    };
  }
  
  /**
   * 记录技能执行结果
   */
  private logSkillResults(operation: string, results: any[]): void {
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`[SkillsIntegration] ${operation}: ${successful}/${total} skills executed successfully`);
    
    // 实际实现中可以存储到数据库或日志系统
    results.forEach((result, index) => {
      if (!result.success) {
        console.warn(`[SkillsIntegration] Skill execution failed: ${result.error}`);
      }
    });
  }
}

// 默认导出单例实例
export const skillsIntegrationManager = new SkillsIntegrationManager();
export const skillsIntegrationHooks = new SkillsIntegrationHooks();