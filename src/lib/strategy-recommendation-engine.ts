/**
 * Strategy Recommendation Engine for FYMail
 * 
 * 基于联系人/任务特征给出推荐策略的引擎。
 * 使用规则引擎和简单机器学习（基于历史性能）来推荐最优发送策略。
 * 
 * 硬约束：不修改登录代码、登录流程、鉴权逻辑。
 */

import { bulkSendStrategyManager, type SendStrategy } from './bulk-send-strategy';

export interface ContactCharacteristics {
  /** 联系人数量 */
  count: number;
  /** 地域分布 */
  countryDistribution: Record<string, number>;
  /** 数据质量分布 */
  dataQualityDistribution: Record<'A' | 'B' | 'C', number>;
  /** 行业标签 */
  industryTags: string[];
  /** 公司规模分布 */
  companySizeDistribution: Record<string, number>;
  /** 最近发送间隔（天）的平均值 */
  averageSendIntervalDays?: number;
  /** 历史打开率（如果有） */
  historicalOpenRate?: number;
  /** 历史回复率（如果有） */
  historicalReplyRate?: number;
}

export interface TaskCharacteristics {
  /** 任务目标 */
  goals: string[];
  /** 优先级 */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** 时间约束 */
  timeConstraint?: {
    deadline?: string;
    maxDurationHours?: number;
  };
  /** 预算约束（如果适用） */
  budgetConstraint?: {
    maxCostPerContact?: number;
    totalBudget?: number;
  };
  /** 风险承受能力 */
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  /** 个性化要求 */
  personalizationRequirement: 'none' | 'basic' | 'advanced' | 'maximum';
}

export interface StrategyRecommendation {
  /** 推荐策略ID */
  strategyId: string;
  /** 策略名称 */
  strategyName: string;
  /** 推荐理由 */
  reasoning: string[];
  /** 置信度（0-1） */
  confidence: number;
  /** 预期指标 */
  expectedMetrics: {
    openRate: number;
    replyRate: number;
    conversionRate: number;
    completionTime: string;
    estimatedContactsReached: number;
  };
  /** 推荐调整 */
  recommendedAdjustments: Array<{
    field: string;
    currentValue?: any;
    recommendedValue: any;
    impact: 'positive' | 'neutral' | 'negative';
  }>;
  /** 适用性评分（0-100） */
  suitabilityScore: number;
}

export interface HistoricalPerformanceData {
  /** 策略ID */
  strategyId: string;
  /** 执行次数 */
  executionCount: number;
  /** 平均打开率 */
  averageOpenRate: number;
  /** 平均回复率 */
  averageReplyRate: number;
  /** 平均转化率 */
  averageConversionRate: number;
  /** 平均退订率 */
  averageUnsubscribeRate: number;
  /** 平均退回率 */
  averageBounceRate: number;
  /** 成功率（任务完成比例） */
  successRate: number;
  /** 最后执行时间 */
  lastExecuted: string;
  /** 按联系人特征的细分性能 */
  performanceByContactCount?: Record<string, number>;
  performanceByCountry?: Record<string, number>;
  performanceByDataQuality?: Record<string, number>;
}

/**
 * 策略推荐引擎
 */
export class StrategyRecommendationEngine {
  private historicalPerformance: Map<string, HistoricalPerformanceData> = new Map();
  
  constructor() {
    this.initializeHistoricalPerformance();
  }
  
  /**
   * 初始化历史性能数据（模拟）
   */
  private initializeHistoricalPerformance(): void {
    // 模拟历史数据 - 实际实现中应从数据库加载
    const strategies = bulkSendStrategyManager.getAllStrategies();
    
    strategies.forEach(strategy => {
      // 为每个策略生成模拟性能数据
      const baseOpenRate = this.getBaseOpenRateForStrategy(strategy.id);
      const baseReplyRate = baseOpenRate * 0.3; // 回复率约为打开率的30%
      const baseConversionRate = baseReplyRate * 0.4; // 转化率约为回复率的40%
      
      this.historicalPerformance.set(strategy.id, {
        strategyId: strategy.id,
        executionCount: Math.floor(Math.random() * 50) + 5,
        averageOpenRate: baseOpenRate + (Math.random() * 0.1 - 0.05),
        averageReplyRate: baseReplyRate + (Math.random() * 0.03 - 0.015),
        averageConversionRate: baseConversionRate + (Math.random() * 0.02 - 0.01),
        averageUnsubscribeRate: 0.01 + Math.random() * 0.02,
        averageBounceRate: 0.02 + Math.random() * 0.03,
        successRate: 0.85 + Math.random() * 0.1,
        lastExecuted: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    });
  }
  
  /**
   * 根据策略ID获取基础打开率
   */
  private getBaseOpenRateForStrategy(strategyId: string): number {
    switch (strategyId) {
      case 'conservative': return 0.18;
      case 'balanced': return 0.22;
      case 'aggressive': return 0.15;
      case 'european-freight': return 0.20;
      default: return 0.20;
    }
  }
  
  /**
   * 生成策略推荐
   */
  async generateRecommendations(
    contacts: any[],
    taskCharacteristics: TaskCharacteristics
  ): Promise<StrategyRecommendation[]> {
    // 分析联系人特征
    const contactCharacteristics = this.analyzeContactCharacteristics(contacts);
    
    // 获取所有可用策略
    const allStrategies = bulkSendStrategyManager.getAllStrategies();
    
    // 为每个策略计算适用性评分
    const recommendations: StrategyRecommendation[] = [];
    
    for (const strategy of allStrategies) {
      if (!strategy.enabled) continue;
      
      const suitabilityScore = this.calculateSuitabilityScore(
        strategy,
        contactCharacteristics,
        taskCharacteristics
      );
      
      const confidence = this.calculateConfidence(
        strategy.id,
        contactCharacteristics,
        taskCharacteristics
      );
      
      const expectedMetrics = this.calculateExpectedMetrics(
        strategy.id,
        contactCharacteristics,
        taskCharacteristics
      );
      
      const recommendedAdjustments = this.suggestAdjustments(
        strategy,
        contactCharacteristics,
        taskCharacteristics
      );
      
      const reasoning = this.generateReasoning(
        strategy,
        contactCharacteristics,
        taskCharacteristics,
        suitabilityScore
      );
      
      recommendations.push({
        strategyId: strategy.id,
        strategyName: strategy.name,
        reasoning,
        confidence,
        expectedMetrics,
        recommendedAdjustments,
        suitabilityScore,
      });
    }
    
    // 按适用性评分排序
    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
  
  /**
   * 分析联系人特征
   */
  private analyzeContactCharacteristics(contacts: any[]): ContactCharacteristics {
    const countryDistribution: Record<string, number> = {};
    const dataQualityDistribution: Record<'A' | 'B' | 'C', number> = { A: 0, B: 0, C: 0 };
    const industryTags: string[] = [];
    const companySizeDistribution: Record<string, number> = {};
    
    contacts.forEach(contact => {
      // 国家分布
      if (contact.country) {
        countryDistribution[contact.country] = (countryDistribution[contact.country] || 0) + 1;
      }
      
      // 数据质量分布
      const dataQuality = contact.dataQuality as 'A' | 'B' | 'C' | undefined;
      if (dataQuality && dataQualityDistribution[dataQuality] !== undefined) {
        dataQualityDistribution[dataQuality]++;
      } else {
        dataQualityDistribution.C++; // 默认为C
      }
      
      // 行业标签（从tags中提取）
      if (contact.tags && Array.isArray(contact.tags)) {
        contact.tags.forEach((tag: string) => {
          if (tag.includes('industry:') || tag.includes('dept:') || tag.includes('freight') || tag.includes('logistics')) {
            if (!industryTags.includes(tag)) {
              industryTags.push(tag);
            }
          }
        });
      }
      
      // 公司规模分布
      if (contact.companySize) {
        companySizeDistribution[contact.companySize] = (companySizeDistribution[contact.companySize] || 0) + 1;
      }
    });
    
    return {
      count: contacts.length,
      countryDistribution,
      dataQualityDistribution,
      industryTags,
      companySizeDistribution,
      // 模拟数据 - 实际实现中应计算真实值
      averageSendIntervalDays: contacts.length > 0 ? 21 : undefined,
      historicalOpenRate: contacts.length > 0 ? 0.18 + Math.random() * 0.1 : undefined,
      historicalReplyRate: contacts.length > 0 ? 0.05 + Math.random() * 0.05 : undefined,
    };
  }
  
  /**
   * 计算策略适用性评分（0-100）
   */
  private calculateSuitabilityScore(
    strategy: SendStrategy,
    contactCharacteristics: ContactCharacteristics,
    taskCharacteristics: TaskCharacteristics
  ): number {
    let score = 50; // 基础分
    
    // 1. 联系人数量匹配度（15分）
    const countScore = this.evaluateContactCountMatch(strategy, contactCharacteristics.count);
    score += countScore;
    
    // 2. 风险承受能力匹配度（15分）
    const riskScore = this.evaluateRiskToleranceMatch(strategy, taskCharacteristics.riskTolerance);
    score += riskScore;
    
    // 3. 数据质量匹配度（10分）
    const qualityScore = this.evaluateDataQualityMatch(strategy, contactCharacteristics.dataQualityDistribution);
    score += qualityScore;
    
    // 4. 地域匹配度（10分）
    const geographyScore = this.evaluateGeographyMatch(strategy, contactCharacteristics.countryDistribution);
    score += geographyScore;
    
    // 5. 个性化要求匹配度（10分）
    const personalizationScore = this.evaluatePersonalizationMatch(strategy, taskCharacteristics.personalizationRequirement);
    score += personalizationScore;
    
    // 6. 历史性能加权（如果可用）（10分）
    const historicalScore = this.evaluateHistoricalPerformance(strategy.id);
    score += historicalScore;
    
    // 限制在0-100之间
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 评估联系人数量匹配度
   */
  private evaluateContactCountMatch(strategy: SendStrategy, contactCount: number): number {
    const batchSize = strategy.batching.batchSize;
    const maxDailySends = strategy.batching.maxDailySends;
    
    if (contactCount <= 100) {
      // 小规模发送适合保守策略
      return strategy.id === 'conservative' ? 15 : 
             strategy.id === 'balanced' ? 10 : 5;
    } else if (contactCount <= 500) {
      // 中等规模适合平衡策略
      return strategy.id === 'balanced' ? 15 :
             strategy.id === 'aggressive' ? 10 : 5;
    } else {
      // 大规模适合积极策略
      return strategy.id === 'aggressive' ? 15 :
             strategy.id === 'balanced' ? 10 : 5;
    }
  }
  
  /**
   * 评估风险承受能力匹配度
   */
  private evaluateRiskToleranceMatch(strategy: SendStrategy, riskTolerance: string): number {
    const strategyRisk = this.getStrategyRiskLevel(strategy.id);
    
    if (strategyRisk === riskTolerance) {
      return 15; // 完美匹配
    }
    
    // 部分匹配
    if ((strategyRisk === 'conservative' && riskTolerance === 'balanced') ||
        (strategyRisk === 'balanced' && riskTolerance === 'conservative') ||
        (strategyRisk === 'balanced' && riskTolerance === 'aggressive') ||
        (strategyRisk === 'aggressive' && riskTolerance === 'balanced')) {
      return 10;
    }
    
    return 5; // 不匹配
  }
  
  /**
   * 获取策略风险等级
   */
  private getStrategyRiskLevel(strategyId: string): 'conservative' | 'balanced' | 'aggressive' {
    switch (strategyId) {
      case 'conservative': return 'conservative';
      case 'balanced': return 'balanced';
      case 'aggressive': return 'aggressive';
      case 'european-freight': return 'balanced';
      default: return 'balanced';
    }
  }
  
  /**
   * 评估数据质量匹配度
   */
  private evaluateDataQualityMatch(
    strategy: SendStrategy,
    dataQualityDistribution: Record<'A' | 'B' | 'C', number>
  ): number {
    const total = dataQualityDistribution.A + dataQualityDistribution.B + dataQualityDistribution.C;
    if (total === 0) return 5; // 无数据
    
    const highQualityRatio = (dataQualityDistribution.A + dataQualityDistribution.B) / total;
    const minQuality = strategy.filtering.minDataQuality;
    
    // 高质量联系人比例高时，可以容忍更严格的质量要求
    if (highQualityRatio >= 0.7) {
      // 高质量联系人多
      return minQuality === 'A' ? 10 : 8;
    } else if (highQualityRatio >= 0.4) {
      // 中等质量
      return minQuality === 'B' ? 10 : 8;
    } else {
      // 低质量
      return minQuality === 'C' ? 10 : 8;
    }
  }
  
  /**
   * 评估地域匹配度
   */
  private evaluateGeographyMatch(
    strategy: SendStrategy,
    countryDistribution: Record<string, number>
  ): number {
    const strategyCountries = strategy.filtering.countries;
    
    if (strategyCountries.length === 0) {
      // 策略没有地域限制，通用性好
      return 8;
    }
    
    // 检查联系人是否主要来自策略支持的国家
    const totalContacts = Object.values(countryDistribution).reduce((a, b) => a + b, 0);
    if (totalContacts === 0) return 5;
    
    let supportedContacts = 0;
    Object.entries(countryDistribution).forEach(([country, count]) => {
      if (strategyCountries.includes(country)) {
        supportedContacts += count;
      }
    });
    
    const supportedRatio = supportedContacts / totalContacts;
    
    if (supportedRatio >= 0.8) {
      return 10; // 高度匹配
    } else if (supportedRatio >= 0.5) {
      return 7; // 中等匹配
    } else {
      return 3; // 低匹配
    }
  }
  
  /**
   * 评估个性化要求匹配度
   */
  private evaluatePersonalizationMatch(
    strategy: SendStrategy,
    personalizationRequirement: string
  ): number {
    const strategyLevel = strategy.personalization.level;
    
    // 映射个性化级别到数值
    const levelValues: Record<string, number> = {
      'none': 0,
      'basic': 1,
      'advanced': 2,
      'maximum': 3
    };
    
    const requirementValue = levelValues[personalizationRequirement] ?? 1;
    const strategyValue = levelValues[strategyLevel] ?? 1;
    
    const diff = Math.abs(requirementValue - strategyValue);
    
    if (diff === 0) return 10; // 完全匹配
    if (diff === 1) return 7;  // 接近匹配
    return 3; // 不匹配
  }
  
  /**
   * 评估历史性能
   */
  private evaluateHistoricalPerformance(strategyId: string): number {
    const performance = this.historicalPerformance.get(strategyId);
    if (!performance || performance.executionCount < 5) {
      return 5; // 数据不足
    }
    
    // 基于成功率和打开率评分
    const successScore = performance.successRate * 5; // 0-5分
    const openRateScore = (performance.averageOpenRate / 0.3) * 5; // 假设0.3是优秀打开率
    
    return (successScore + openRateScore) / 2;
  }
  
  /**
   * 计算推荐置信度（0-1）
   */
  private calculateConfidence(
    strategyId: string,
    contactCharacteristics: ContactCharacteristics,
    taskCharacteristics: TaskCharacteristics
  ): number {
    let confidence = 0.7; // 基础置信度
    
    // 基于数据量的置信度调整
    if (contactCharacteristics.count >= 100) {
      confidence += 0.15; // 数据量大，置信度高
    } else if (contactCharacteristics.count < 20) {
      confidence -= 0.2; // 数据量小，置信度低
    }
    
    // 基于历史性能数据的置信度调整
    const performance = this.historicalPerformance.get(strategyId);
    if (performance && performance.executionCount >= 10) {
      confidence += 0.1;
    }
    
    // 限制在0.3-0.95之间
    return Math.max(0.3, Math.min(0.95, confidence));
  }
  
  /**
   * 计算预期指标
   */
  private calculateExpectedMetrics(
    strategyId: string,
    contactCharacteristics: ContactCharacteristics,
    taskCharacteristics: TaskCharacteristics
  ) {
    const baseMetrics = this.getBaseMetricsForStrategy(strategyId);
    
    // 根据联系人特征调整
    const contactCount = contactCharacteristics.count;
    const highQualityRatio = contactCharacteristics.dataQualityDistribution.A / contactCount;
    
    // 调整打开率
    let openRate = baseMetrics.openRate;
    if (highQualityRatio > 0.7) {
      openRate *= 1.15; // 高质量联系人提高打开率
    } else if (highQualityRatio < 0.3) {
      openRate *= 0.85; // 低质量联系人降低打开率
    }
    
    // 调整回复率
    let replyRate = baseMetrics.replyRate;
    if (taskCharacteristics.personalizationRequirement === 'maximum' || 
        taskCharacteristics.personalizationRequirement === 'advanced') {
      replyRate *= 1.2; // 高级个性化提高回复率
    }
    
    // 计算完成时间
    const batchSize = this.getBatchSizeForStrategy(strategyId);
    const batches = Math.ceil(contactCount / batchSize);
    const hoursPerBatch = 0.5; // 每批次大约0.5小时
    const completionTimeHours = Math.max(1, Math.ceil(batches * hoursPerBatch));
    
    return {
      openRate: parseFloat(openRate.toFixed(3)),
      replyRate: parseFloat(replyRate.toFixed(3)),
      conversionRate: parseFloat((replyRate * 0.4).toFixed(3)), // 假设转化率是回复率的40%
      completionTime: `${completionTimeHours}小时`,
      estimatedContactsReached: Math.floor(contactCount * 0.95), // 估计95%的联系人会收到邮件
    };
  }
  
  /**
   * 获取策略的基础指标
   */
  private getBaseMetricsForStrategy(strategyId: string): { openRate: number; replyRate: number } {
    switch (strategyId) {
      case 'conservative': return { openRate: 0.18, replyRate: 0.06 };
      case 'balanced': return { openRate: 0.22, replyRate: 0.08 };
      case 'aggressive': return { openRate: 0.15, replyRate: 0.05 };
      case 'european-freight': return { openRate: 0.20, replyRate: 0.09 };
      default: return { openRate: 0.20, replyRate: 0.07 };
    }
  }
  
  /**
   * 获取策略的批次大小
   */
  private getBatchSizeForStrategy(strategyId: string): number {
    const strategy = bulkSendStrategyManager.getStrategy(strategyId);
    return strategy?.batching.batchSize || 50;
  }
  
  /**
   * 建议调整
   */
  private suggestAdjustments(
    strategy: SendStrategy,
    contactCharacteristics: ContactCharacteristics,
    taskCharacteristics: TaskCharacteristics
  ) {
    const adjustments: Array<{
      field: string;
      currentValue?: any;
      recommendedValue: any;
      impact: 'positive' | 'neutral' | 'negative';
    }> = [];
    
    // 根据联系人数量调整批次大小
    const contactCount = contactCharacteristics.count;
    const currentBatchSize = strategy.batching.batchSize;
    
    if (contactCount < 50 && currentBatchSize > 30) {
      adjustments.push({
        field: 'batchSize',
        currentValue: currentBatchSize,
        recommendedValue: 30,
        impact: 'positive',
      });
    } else if (contactCount > 500 && currentBatchSize < 80) {
      adjustments.push({
        field: 'batchSize',
        currentValue: currentBatchSize,
        recommendedValue: 80,
        impact: 'positive',
      });
    }
    
    // 根据数据质量调整筛选门槛
    const highQualityRatio = contactCharacteristics.dataQualityDistribution.A / contactCount;
    if (highQualityRatio > 0.7 && strategy.filtering.minDataQuality === 'C') {
      adjustments.push({
        field: 'minDataQuality',
        currentValue: strategy.filtering.minDataQuality,
        recommendedValue: 'B',
        impact: 'positive',
      });
    }
    
    // 根据风险承受能力调整发送频率
    if (taskCharacteristics.riskTolerance === 'conservative' && 
        strategy.compliance.frequencyLimit !== 'conservative') {
      adjustments.push({
        field: 'frequencyLimit',
        currentValue: strategy.compliance.frequencyLimit,
        recommendedValue: 'conservative',
        impact: 'positive',
      });
    }
    
    return adjustments;
  }
  
  /**
   * 生成推荐理由
   */
  private generateReasoning(
    strategy: SendStrategy,
    contactCharacteristics: ContactCharacteristics,
    taskCharacteristics: TaskCharacteristics,
    suitabilityScore: number
  ): string[] {
    const reasoning: string[] = [];
    const contactCount = contactCharacteristics.count;
    
    // 基于联系人数量
    if (contactCount <= 100) {
      reasoning.push(`适合小规模发送（${contactCount}个联系人）`);
    } else if (contactCount <= 500) {
      reasoning.push(`适合中等规模发送（${contactCount}个联系人）`);
    } else {
      reasoning.push(`适合大规模发送（${contactCount}个联系人）`);
    }
    
    // 基于风险承受能力
    const riskMatch = this.getStrategyRiskLevel(strategy.id) === taskCharacteristics.riskTolerance;
    if (riskMatch) {
      reasoning.push(`风险承受能力匹配（${taskCharacteristics.riskTolerance}）`);
    }
    
    // 基于数据质量
    const highQualityRatio = contactCharacteristics.dataQualityDistribution.A / contactCount;
    if (highQualityRatio > 0.7) {
      reasoning.push('高质量联系人比例高，适合严格筛选');
    }
    
    // 基于个性化要求
    if (strategy.personalization.level === taskCharacteristics.personalizationRequirement) {
      reasoning.push(`个性化级别匹配（${taskCharacteristics.personalizationRequirement}）`);
    }
    
    // 基于适用性评分
    if (suitabilityScore >= 80) {
      reasoning.push('高度适合当前任务');
    } else if (suitabilityScore >= 60) {
      reasoning.push('比较适合当前任务');
    } else {
      reasoning.push('基本适合当前任务');
    }
    
    return reasoning;
  }
  
  /**
   * 记录策略执行结果（用于改进推荐）
   */
  async recordStrategyExecution(
    strategyId: string,
    actualMetrics: {
      openRate?: number;
      replyRate?: number;
      conversionRate?: number;
      unsubscribeRate?: number;
      bounceRate?: number;
      success: boolean;
    },
    contactCharacteristics: ContactCharacteristics,
    taskCharacteristics: TaskCharacteristics
  ): Promise<void> {
    // 更新历史性能数据
    const currentPerformance = this.historicalPerformance.get(strategyId) || {
      strategyId,
      executionCount: 0,
      averageOpenRate: 0,
      averageReplyRate: 0,
      averageConversionRate: 0,
      averageUnsubscribeRate: 0,
      averageBounceRate: 0,
      successRate: 0,
      lastExecuted: new Date().toISOString(),
    };
    
    // 更新执行次数
    currentPerformance.executionCount += 1;
    
    // 更新平均值（移动平均）
    const weight = 1 / currentPerformance.executionCount;
    
    if (actualMetrics.openRate !== undefined) {
      currentPerformance.averageOpenRate = 
        currentPerformance.averageOpenRate * (1 - weight) + actualMetrics.openRate * weight;
    }
    
    if (actualMetrics.replyRate !== undefined) {
      currentPerformance.averageReplyRate = 
        currentPerformance.averageReplyRate * (1 - weight) + actualMetrics.replyRate * weight;
    }
    
    if (actualMetrics.conversionRate !== undefined) {
      currentPerformance.averageConversionRate = 
        currentPerformance.averageConversionRate * (1 - weight) + actualMetrics.conversionRate * weight;
    }
    
    if (actualMetrics.unsubscribeRate !== undefined) {
      currentPerformance.averageUnsubscribeRate = 
        currentPerformance.averageUnsubscribeRate * (1 - weight) + actualMetrics.unsubscribeRate * weight;
    }
    
    if (actualMetrics.bounceRate !== undefined) {
      currentPerformance.averageBounceRate = 
        currentPerformance.averageBounceRate * (1 - weight) + actualMetrics.bounceRate * weight;
    }
    
    // 更新成功率
    const successCount = currentPerformance.successRate * (currentPerformance.executionCount - 1);
    currentPerformance.successRate = (successCount + (actualMetrics.success ? 1 : 0)) / currentPerformance.executionCount;
    
    currentPerformance.lastExecuted = new Date().toISOString();
    
    this.historicalPerformance.set(strategyId, currentPerformance);
    
    // TODO: 实际实现中应持久化到数据库
    console.log(`[StrategyRecommendationEngine] Recorded execution for strategy ${strategyId}`);
  }
  
  /**
   * 获取历史性能数据
   */
  getHistoricalPerformance(strategyId?: string): HistoricalPerformanceData | HistoricalPerformanceData[] {
    if (strategyId) {
      return this.historicalPerformance.get(strategyId) || {
        strategyId,
        executionCount: 0,
        averageOpenRate: 0,
        averageReplyRate: 0,
        averageConversionRate: 0,
        averageUnsubscribeRate: 0,
        averageBounceRate: 0,
        successRate: 0,
        lastExecuted: new Date().toISOString(),
      };
    }
    
    return Array.from(this.historicalPerformance.values());
  }
}

// 默认导出单例
export const strategyRecommendationEngine = new StrategyRecommendationEngine();