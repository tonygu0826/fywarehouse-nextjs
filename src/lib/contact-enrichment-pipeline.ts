/**
 * Contact Enrichment Pipeline for FYMail
 * 
 * 强化联系人enrichment的更真实执行链路。
 * 模拟真实的数据增强流程，包括多个步骤和外部API调用。
 */

import { skillExecutor, type SkillContext } from './skills-registry';
import { skillExecutionLogger } from './skill-execution-logger';
import type { FymailContact } from './fymail';

export interface EnrichmentStep {
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description: string;
  /** 对应的工作流阶段 */
  workflowStage: string;
  /** 是否启用 */
  enabled: boolean;
  /** 执行函数 */
  execute: (contact: Partial<FymailContact>, context: SkillContext) => Promise<EnrichmentStepResult>;
}

export interface EnrichmentStepResult {
  /** 步骤是否成功 */
  success: boolean;
  /** 增强后的联系人数据 */
  enrichedContact?: Partial<FymailContact>;
  /** 步骤输出数据 */
  output?: Record<string, any>;
  /** 错误信息 */
  error?: string;
  /** 执行耗时（毫秒） */
  durationMs: number;
  /** 外部API调用标识 */
  externalApiCalled?: boolean;
}

/**
 * 联系人enrichment管道
 */
export class ContactEnrichmentPipeline {
  protected steps: EnrichmentStep[];
  
  constructor() {
    this.steps = this.createDefaultSteps();
  }
  
  /**
   * 创建默认的enrichment步骤
   */
  private createDefaultSteps(): EnrichmentStep[] {
    return [
      {
        name: '数据验证与标准化',
        description: '验证联系人数据格式，标准化电话号码、邮箱地址等',
        workflowStage: 'contact-validation',
        enabled: true,
        execute: this.executeValidationStep.bind(this),
      },
      {
        name: '基础信息增强',
        description: '通过公开数据源增强公司信息、职位信息等',
        workflowStage: 'contact-enrichment',
        enabled: true,
        execute: this.executeBasicEnrichmentStep.bind(this),
      },
      {
        name: '公司信息查找',
        description: '查找公司详细信息：行业、规模、收入范围等',
        workflowStage: 'contact-enrichment',
        enabled: true,
        execute: this.executeCompanyLookupStep.bind(this),
      },
      {
        name: '社交资料关联',
        description: '关联LinkedIn、Twitter等社交资料',
        workflowStage: 'contact-enrichment',
        enabled: true,
        execute: this.executeSocialProfilesStep.bind(this),
      },
      {
        name: '地域信息增强',
        description: '添加时区、本地时间、节假日信息等',
        workflowStage: 'contact-enrichment',
        enabled: true,
        execute: this.executeGeographicEnrichmentStep.bind(this),
      },
      {
        name: '数据质量评分',
        description: '计算联系人数据的综合质量评分',
        workflowStage: 'data-quality-scoring',
        enabled: true,
        execute: this.executeQualityScoringStep.bind(this),
      },
      {
        name: '个性化标记',
        description: '根据行业、职位、地域添加个性化标记',
        workflowStage: 'contact-enrichment',
        enabled: true,
        execute: this.executePersonalizationTaggingStep.bind(this),
      },
    ];
  }
  
  /**
   * 执行完整的enrichment管道
   */
  async executePipeline(
    contact: Partial<FymailContact>,
    userId?: string
  ): Promise<{
    enrichedContact: Partial<FymailContact>;
    stepResults: EnrichmentStepResult[];
    overallQuality: 'A' | 'B' | 'C';
    totalDurationMs: number;
  }> {
    const startTime = Date.now();
    const stepResults: EnrichmentStepResult[] = [];
    let currentContact = { ...contact };
    
    const context: SkillContext = {
      workflowStage: 'contact-enrichment',
      contact: currentContact,
      userConfig: {},
    };
    
    // 首先执行技能集成的工作流阶段
    try {
      const skillResults = await skillExecutor.executeForWorkflowStage(
        'contact-validation',
        context
      );
      
      // 应用技能结果
      for (const result of skillResults) {
        if (result.success && result.data) {
          currentContact = this.applySkillResultToContact(currentContact, result.data);
        }
      }
      
      // 记录技能执行
      await this.logSkillExecution('contact-validation', skillResults, userId);
    } catch (error) {
      console.warn('[EnrichmentPipeline] Skill execution failed:', error);
    }
    
    // 执行每个enrichment步骤
    for (const step of this.steps) {
      if (!step.enabled) continue;
      
      try {
        const stepStartTime = Date.now();
        const result = await step.execute(currentContact, context);
        result.durationMs = Date.now() - stepStartTime;
        
        stepResults.push(result);
        
        if (result.success && result.enrichedContact) {
          currentContact = { ...currentContact, ...result.enrichedContact };
        }
        
        // 模拟外部API调用延迟
        if (result.externalApiCalled) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        stepResults.push({
          success: false,
          error: error instanceof Error ? error.message : 'Step execution failed',
          durationMs: 0,
        });
      }
    }
    
    // 计算整体数据质量
    const overallQuality = this.calculateOverallQuality(currentContact, stepResults);
    
    // 如果整体质量高，添加奖励标记
    if (overallQuality === 'A') {
      currentContact.tags = [...(currentContact.tags || []), 'high-quality', 'premium-enriched'];
    }
    
    const totalDurationMs = Date.now() - startTime;
    
    return {
      enrichedContact: currentContact,
      stepResults,
      overallQuality,
      totalDurationMs,
    };
  }
  
  /**
   * 应用技能结果到联系人
   */
  private applySkillResultToContact(
    contact: Partial<FymailContact>,
    skillData: Record<string, any>
  ): Partial<FymailContact> {
    const updated = { ...contact };
    
    if (skillData.enrichedFields) {
      updated.tags = [...(updated.tags || []), ...skillData.enrichedFields.map((f: string) => `enriched:${f}`)];
    }
    
    if (skillData.qualityScore !== undefined) {
      // 更新数据质量
      const score = skillData.qualityScore;
      if (score >= 80) updated.dataQuality = 'A';
      else if (score >= 60) updated.dataQuality = 'B';
      else updated.dataQuality = 'C';
    }
    
    if (skillData.enrichmentData) {
      const enrichment = skillData.enrichmentData;
      
      if (enrichment.companyInfo?.industry) {
        updated.tags = [...(updated.tags || []), `industry:${enrichment.companyInfo.industry}`];
      }
      
      if (enrichment.companyInfo?.employeeCount) {
        updated.companySize = enrichment.companyInfo.employeeCount.toString();
      }
      
      if (enrichment.contactEnhancement?.department) {
        updated.tags = [...(updated.tags || []), `dept:${enrichment.contactEnhancement.department}`];
      }
      
      if (enrichment.geographicData?.timezone) {
        updated.tags = [...(updated.tags || []), `timezone:${enrichment.geographicData.timezone}`];
      }
    }
    
    return updated;
  }
  
  /**
   * 计算整体数据质量
   */
  private calculateOverallQuality(
    contact: Partial<FymailContact>,
    stepResults: EnrichmentStepResult[]
  ): 'A' | 'B' | 'C' {
    // 基础分数
    let score = 0;
    
    // 字段完整性
    if (contact.firstName && contact.lastName) score += 20;
    if (contact.email) score += 15;
    if (contact.company) score += 10;
    if (contact.country) score += 5;
    
    // 增强数据
    if (contact.tags?.includes('industry:')) score += 10;
    if (contact.companySize) score += 5;
    if (contact.tags?.includes('timezone:')) score += 5;
    
    // 步骤成功率
    const successfulSteps = stepResults.filter(r => r.success).length;
    const totalSteps = stepResults.length;
    if (totalSteps > 0) {
      const successRate = successfulSteps / totalSteps;
      score += Math.round(successRate * 30);
    }
    
    // 已有数据质量
    if (contact.dataQuality === 'A') score += 20;
    else if (contact.dataQuality === 'B') score += 10;
    else if (contact.dataQuality === 'C') score += 5;
    
    // 最终评级
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    return 'C';
  }
  
  /**
   * 记录技能执行
   */
  private async logSkillExecution(
    workflowStage: string,
    results: any[],
    userId?: string
  ): Promise<void> {
    for (const result of results) {
      if (result.skillId) {
        await skillExecutionLogger.logSkillExecution(
          result.skillId,
          result.skillName || 'Unknown',
          'workflowStage',
          result,
          { workflowStage },
          undefined,
          userId
        ).catch(error => {
          console.warn('[EnrichmentPipeline] Failed to log skill execution:', error);
        });
      }
    }
  }
  
  // ==================== 步骤执行函数 ====================
  
  /**
   * 数据验证与标准化步骤
   */
  private async executeValidationStep(
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    const startTime = Date.now();
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 30));
      
      const updates: Partial<FymailContact> = {};
      const output: Record<string, any> = {
        validatedFields: [],
        standardizationApplied: [],
      };
      
      // 邮箱验证
      if (contact.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(contact.email);
        output.emailValid = isValid;
        output.validatedFields.push('email');
        
        if (isValid) {
          // 标准化邮箱（小写）
          updates.email = contact.email.toLowerCase();
          output.standardizationApplied.push('email');
        }
      }
      
      // 电话号码标准化
      if (contact.phone) {
        output.validatedFields.push('phone');
        // 简单标准化：移除空格和特殊字符
        const cleaned = contact.phone.replace(/[\s\-()]/g, '');
        if (cleaned.length >= 8) {
          updates.phone = cleaned;
          output.standardizationApplied.push('phone');
        }
      }
      
      // 公司名称标准化
      if (contact.company) {
        output.validatedFields.push('company');
        // 移除多余空格，首字母大写
        const cleaned = contact.company
          .trim()
          .replace(/\s+/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        updates.company = cleaned;
        output.standardizationApplied.push('company');
      }
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        enrichedContact: updates,
        output,
        durationMs,
        externalApiCalled: false,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        durationMs,
      };
    }
  }
  
  /**
   * 基础信息增强步骤
   */
  private async executeBasicEnrichmentStep(
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    const startTime = Date.now();
    
    try {
      // 模拟外部API调用延迟
      await new Promise(resolve => setTimeout(resolve, 80));
      
      const updates: Partial<FymailContact> = {};
      const output: Record<string, any> = {
        sources: ['public-directories', 'business-databases'],
        confidence: 0.85,
      };
      
      // 根据邮箱域名推断公司信息
      if (contact.email && !contact.company) {
        const domain = contact.email.split('@')[1];
        if (domain) {
          const companyName = domain.split('.')[0];
          updates.company = companyName.charAt(0).toUpperCase() + companyName.slice(1);
          output.inferredCompany = updates.company;
        }
      }
      
      // 根据公司名称推断国家（简单逻辑）
      if (contact.company && !contact.country) {
        // 简单关键词匹配
        const companyLower = contact.company.toLowerCase();
        if (companyLower.includes('gmbh') || companyLower.includes('ag')) {
          updates.country = 'DE';
        } else if (companyLower.includes('ltd') || companyLower.includes('plc')) {
          updates.country = 'UK';
        } else if (companyLower.includes('sas') || companyLower.includes('sa')) {
          updates.country = 'FR';
        } else if (companyLower.includes('bv') || companyLower.includes('nv')) {
          updates.country = 'NL';
        }
        if (updates.country) {
          output.inferredCountry = updates.country;
        }
      }
      
      // 添加基础标签
      updates.tags = [...(contact.tags || []), 'basically-enriched', 'api-enhanced'];
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        enrichedContact: updates,
        output,
        durationMs,
        externalApiCalled: true,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Basic enrichment failed',
        durationMs,
      };
    }
  }
  
  /**
   * 公司信息查找步骤
   */
  private async executeCompanyLookupStep(
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    const startTime = Date.now();
    
    try {
      // 模拟外部API调用延迟
      await new Promise(resolve => setTimeout(resolve, 120));
      
      const updates: Partial<FymailContact> = {};
      const output: Record<string, any> = {
        sources: ['company-database-api', 'business-registry'],
        apiCalls: 2,
      };
      
      // 模拟公司信息查找
      if (contact.company) {
        // 模拟行业分类
        const industryMap: Record<string, string> = {
          'logistics': 'Logistics & Freight Forwarding',
          'transport': 'Transportation',
          'shipping': 'Shipping & Maritime',
          'warehouse': 'Warehousing & Storage',
          'forwarding': 'Freight Forwarding',
          'freight': 'Freight Services',
          'logistik': 'Logistics & Freight Forwarding',
          'spedition': 'Freight Forwarding',
        };
        
        const companyLower = contact.company.toLowerCase();
        let industry = 'Other';
        
        for (const [keyword, industryName] of Object.entries(industryMap)) {
          if (companyLower.includes(keyword)) {
            industry = industryName;
            break;
          }
        }
        
        updates.tags = [...(contact.tags || []), `industry:${industry}`];
        output.industry = industry;
        
        // 模拟公司规模（随机）
        const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
        const randomSize = employeeRanges[Math.floor(Math.random() * employeeRanges.length)];
        updates.companySize = randomSize;
        output.employeeRange = randomSize;
        
        // 模拟收入范围
        const revenueRanges = ['<€1M', '€1M-€5M', '€5M-€10M', '€10M-€50M', '€50M-€100M', '€100M+'];
        const randomRevenue = revenueRanges[Math.floor(Math.random() * revenueRanges.length)];
        output.revenueRange = randomRevenue;
      }
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        enrichedContact: updates,
        output,
        durationMs,
        externalApiCalled: true,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Company lookup failed',
        durationMs,
      };
    }
  }
  
  /**
   * 社交资料关联步骤
   */
  private async executeSocialProfilesStep(
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    const startTime = Date.now();
    
    try {
      // 模拟社交API调用延迟
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const updates: Partial<FymailContact> = {};
      const output: Record<string, any> = {
        sources: ['linkedin-api', 'twitter-api'],
        profilesFound: 0,
      };
      
      // 模拟LinkedIn资料查找
      if (contact.firstName && contact.lastName && contact.company) {
        const linkedinUrl = `https://linkedin.com/in/${contact.firstName.toLowerCase()}-${contact.lastName.toLowerCase()}`;
        output.linkedinUrl = linkedinUrl;
        output.profilesFound++;
        
        // 添加到备注或自定义字段
        updates.notes = (contact.notes || '') + `\nLinkedIn: ${linkedinUrl}`;
      }
      
      // 模拟Twitter查找
      if (contact.firstName && contact.lastName) {
        const twitterHandle = `@${contact.firstName.charAt(0)}${contact.lastName}`.toLowerCase();
        output.twitterHandle = twitterHandle;
        output.profilesFound++;
      }
      
      if (output.profilesFound > 0) {
        updates.tags = [...(contact.tags || []), 'social-profiles-found'];
      }
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        enrichedContact: updates,
        output,
        durationMs,
        externalApiCalled: true,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Social profiles lookup failed',
        durationMs,
      };
    }
  }
  
  /**
   * 地域信息增强步骤
   */
  private async executeGeographicEnrichmentStep(
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    const startTime = Date.now();
    
    try {
      // 模拟地理API调用延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updates: Partial<FymailContact> = {};
      const output: Record<string, any> = {
        sources: ['geolocation-api', 'timezone-api'],
      };
      
      // 根据国家确定时区
      const countryTimezoneMap: Record<string, string> = {
        'DE': 'Europe/Berlin',
        'FR': 'Europe/Paris',
        'UK': 'Europe/London',
        'NL': 'Europe/Amsterdam',
        'US': 'America/New_York',
        'CA': 'America/Toronto',
      };
      
      if (contact.country && countryTimezoneMap[contact.country]) {
        const timezone = countryTimezoneMap[contact.country];
        updates.tags = [...(contact.tags || []), `timezone:${timezone}`];
        output.timezone = timezone;
        
        // 计算当前本地时间
        const now = new Date();
        const localTime = now.toLocaleTimeString('en-US', { timeZone: timezone });
        output.localTime = localTime;
        
        // 添加营业时间标签（基于时区）
        const businessHours = this.getBusinessHoursForTimezone(timezone);
        output.businessHours = businessHours;
        updates.tags = [...(updates.tags || []), `business-hours:${businessHours}`];
      }
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        enrichedContact: updates,
        output,
        durationMs,
        externalApiCalled: true,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Geographic enrichment failed',
        durationMs,
      };
    }
  }
  
  /**
   * 数据质量评分步骤
   */
  private async executeQualityScoringStep(
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    const startTime = Date.now();
    
    try {
      // 模拟质量分析延迟
      await new Promise(resolve => setTimeout(resolve, 60));
      
      const output: Record<string, any> = {
        scoringModel: 'comprehensive-v1',
        factors: [],
      };
      
      let score = 0;
      const maxScore = 100;
      
      // 字段完整性（40分）
      if (contact.firstName && contact.lastName) {
        score += 20;
        output.factors.push({ name: 'name-complete', score: 20 });
      }
      if (contact.email) {
        score += 15;
        output.factors.push({ name: 'email-present', score: 15 });
        
        // 邮箱格式额外加分
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(contact.email)) {
          score += 5;
          output.factors.push({ name: 'email-valid-format', score: 5 });
        }
      }
      if (contact.company) {
        score += 10;
        output.factors.push({ name: 'company-present', score: 10 });
      }
      if (contact.country) {
        score += 5;
        output.factors.push({ name: 'country-present', score: 5 });
      }
      
      // 数据丰富度（30分）
      if (contact.tags?.some(tag => tag.startsWith('industry:'))) {
        score += 10;
        output.factors.push({ name: 'industry-identified', score: 10 });
      }
      if (contact.companySize) {
        score += 5;
        output.factors.push({ name: 'company-size-known', score: 5 });
      }
      if (contact.tags?.some(tag => tag.startsWith('timezone:'))) {
        score += 5;
        output.factors.push({ name: 'timezone-identified', score: 5 });
      }
      if (contact.tags?.includes('social-profiles-found')) {
        score += 10;
        output.factors.push({ name: 'social-profiles', score: 10 });
      }
      
      // 数据新鲜度（10分）- 模拟
      score += 8;
      output.factors.push({ name: 'data-freshness', score: 8 });
      
      // 数据一致性（20分）- 模拟
      score += 15;
      output.factors.push({ name: 'data-consistency', score: 15 });
      
      // 确保不超过最大值
      score = Math.min(score, maxScore);
      output.finalScore = score;
      
      // 确定质量等级
      let quality: 'A' | 'B' | 'C' = 'C';
      if (score >= 80) quality = 'A';
      else if (score >= 60) quality = 'B';
      
      output.qualityGrade = quality;
      
      const updates: Partial<FymailContact> = {
        dataQuality: quality,
      };
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        enrichedContact: updates,
        output,
        durationMs,
        externalApiCalled: false,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Quality scoring failed',
        durationMs,
      };
    }
  }
  
  /**
   * 个性化标记步骤
   */
  private async executePersonalizationTaggingStep(
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    const startTime = Date.now();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 40));
      
      const updates: Partial<FymailContact> = {};
      const newTags: string[] = [];
      const output: Record<string, any> = {
        personalizationTags: [],
      };
      
      // 基于行业的个性化标记
      const industryTag = contact.tags?.find(tag => tag.startsWith('industry:'));
      if (industryTag) {
        const industry = industryTag.split(':')[1];
        newTags.push(`personalization-industry:${industry}`);
        output.personalizationTags.push(`industry:${industry}`);
      }
      
      // 基于国家的个性化标记
      if (contact.country) {
        newTags.push(`personalization-country:${contact.country}`);
        output.personalizationTags.push(`country:${contact.country}`);
        
        // 语言偏好
        const languageMap: Record<string, string> = {
          'DE': 'german',
          'FR': 'french',
          'UK': 'english',
          'NL': 'dutch',
          'US': 'english',
          'CA': 'english',
        };
        if (languageMap[contact.country]) {
          newTags.push(`language:${languageMap[contact.country]}`);
          output.personalizationTags.push(`language:${languageMap[contact.country]}`);
        }
      }
      
      // 基于公司规模的个性化标记
      if (contact.companySize) {
        const size = contact.companySize;
        if (size.includes('1-10') || size.includes('11-50')) {
          newTags.push('company-size:small');
        } else if (size.includes('51-200') || size.includes('201-500')) {
          newTags.push('company-size:medium');
        } else if (size.includes('501-1000') || size.includes('1000+')) {
          newTags.push('company-size:large');
        }
        output.personalizationTags.push(`company-size:${size}`);
      }
      
      // 基于数据质量的个性化标记
      if (contact.dataQuality) {
        newTags.push(`data-quality:${contact.dataQuality}`);
        output.personalizationTags.push(`data-quality:${contact.dataQuality}`);
      }
      
      if (newTags.length > 0) {
        updates.tags = [...(contact.tags || []), ...newTags];
      }
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        enrichedContact: updates,
        output,
        durationMs,
        externalApiCalled: false,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Personalization tagging failed',
        durationMs,
      };
    }
  }
  
  /**
   * 根据时区获取营业时间
   */
  private getBusinessHoursForTimezone(timezone: string): string {
    const hoursMap: Record<string, string> = {
      'Europe/Berlin': '09:00-18:00',
      'Europe/Paris': '09:00-18:00',
      'Europe/London': '09:00-17:30',
      'Europe/Amsterdam': '08:30-17:30',
      'America/New_York': '09:00-17:00',
      'America/Toronto': '09:00-17:00',
    };
    
    return hoursMap[timezone] || '09:00-17:00';
  }
  
  /**
   * 获取所有步骤
   */
  getSteps(): EnrichmentStep[] {
    return [...this.steps];
  }
  
  /**
   * 启用/禁用步骤
   */
  setStepEnabled(stepName: string, enabled: boolean): void {
    const step = this.steps.find(s => s.name === stepName);
    if (step) {
      step.enabled = enabled;
    }
  }
}

/**
 * 增强版联系人enrichment管道
 * 添加速率限制、缓存、重试机制和监控
 */
export class EnhancedContactEnrichmentPipeline extends ContactEnrichmentPipeline {
  private cache: Map<string, { result: any; timestamp: number; }>;
  private rateLimiter: { lastCall: number; minIntervalMs: number };
  private retryConfig: { maxRetries: number; baseDelayMs: number };
  private monitoring: { totalCalls: number; failedCalls: number; totalDurationMs: number };
  private stepWrappers: Map<string, (contact: Partial<FymailContact>, context: SkillContext) => Promise<EnrichmentStepResult>>;

  constructor() {
    super();
    this.cache = new Map();
    this.rateLimiter = { lastCall: 0, minIntervalMs: 50 }; // 最小间隔50ms
    this.retryConfig = { maxRetries: 3, baseDelayMs: 100 };
    this.monitoring = { totalCalls: 0, failedCalls: 0, totalDurationMs: 0 };
    this.stepWrappers = new Map();
    this.enhanceSteps();
  }

  /**
   * 增强步骤：包装原始执行函数以添加重试和速率限制
   */
  private enhanceSteps(): void {
    this.steps.forEach(step => {
      const originalExecute = step.execute;
      step.execute = async (contact: Partial<FymailContact>, context: SkillContext) => {
        return this.executeStepWithRetry(step.name, originalExecute, contact, context);
      };
      this.stepWrappers.set(step.name, step.execute);
    });
  }

  /**
   * 带重试和速率限制的步骤执行
   */
  private async executeStepWithRetry(
    stepName: string,
    originalExecute: (contact: Partial<FymailContact>, context: SkillContext) => Promise<EnrichmentStepResult>,
    contact: Partial<FymailContact>,
    context: SkillContext
  ): Promise<EnrichmentStepResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // 应用速率限制
        await this.rateLimit();
        
        const startTime = Date.now();
        const result = await originalExecute(contact, context);
        const durationMs = Date.now() - startTime;
        
        if (result.success) {
          // 更新监控指标
          this.monitoring.totalCalls++;
          this.monitoring.totalDurationMs += durationMs;
          return { ...result, durationMs };
        } else {
          lastError = new Error(result.error || 'Step execution failed');
          this.monitoring.failedCalls++;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.monitoring.failedCalls++;
      }
      
      // 指数退避
      if (attempt < this.retryConfig.maxRetries) {
        const delayMs = this.retryConfig.baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    this.monitoring.totalCalls++;
    this.monitoring.failedCalls++;
    
    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
      durationMs: 0,
    };
  }

  /**
   * 重写 executePipeline 方法以添加缓存和监控
   */
  async executePipeline(
    contact: Partial<FymailContact>,
    userId?: string
  ): Promise<{
    enrichedContact: Partial<FymailContact>;
    stepResults: EnrichmentStepResult[];
    overallQuality: 'A' | 'B' | 'C';
    totalDurationMs: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(contact);
    
    // 检查缓存（仅缓存有效期5分钟）
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        console.log(`[EnhancedPipeline] Using cached enrichment result for ${contact.email}`);
        // 仍然返回监控数据，但使用缓存结果
        this.monitoring.totalCalls++;
        return cached.result;
      }
    }
    
    // 执行原始管道
    const result = await super.executePipeline(contact, userId);
    const totalDurationMs = Date.now() - startTime;
    
    // 更新监控指标（步骤执行期间已更新）
    // 缓存结果
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    
    // 限制缓存大小
    if (this.cache.size > 1000) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    return result;
  }

  /**
   * 速率限制辅助方法
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.rateLimiter.lastCall;
    if (timeSinceLastCall < this.rateLimiter.minIntervalMs) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimiter.minIntervalMs - timeSinceLastCall));
    }
    this.rateLimiter.lastCall = Date.now();
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(contact: Partial<FymailContact>): string {
    const keyFields = [
      contact.email,
      contact.company,
      contact.country,
      contact.dataQuality,
      JSON.stringify(contact.tags),
    ];
    return keyFields.filter(field => field && field !== '').join('|');
  }

  /**
   * 获取监控指标
   */
  getMonitoringMetrics() {
    return {
      ...this.monitoring,
      averageDurationMs: this.monitoring.totalCalls > 0 
        ? this.monitoring.totalDurationMs / this.monitoring.totalCalls 
        : 0,
      successRate: this.monitoring.totalCalls > 0 
        ? 1 - (this.monitoring.failedCalls / this.monitoring.totalCalls)
        : 1,
      cacheSize: this.cache.size,
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// 默认导出增强版单例
export const contactEnrichmentPipeline = new EnhancedContactEnrichmentPipeline();