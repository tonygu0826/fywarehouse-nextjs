/**
 * A/B Testing Framework for FYMail
 * 
 * 策略 A/B 测试的基础能力/结构预留。
 * 提供测试创建、变体分配、结果跟踪和获胜者确定功能。
 * 
 * 硬约束：不修改登录代码、登录流程、鉴权逻辑。
 */

export interface ABTestConfig {
  /** 测试ID */
  testId: string;
  /** 测试名称 */
  name: string;
  /** 测试描述 */
  description: string;
  /** 测试元素 */
  element: 'subject' | 'content' | 'sender' | 'timing' | 'strategy' | 'template';
  /** 测试目标 */
  goal: 'open-rate' | 'click-rate' | 'reply-rate' | 'conversion' | 'engagement';
  /** 变体配置 */
  variants: ABTestVariant[];
  /** 测试受众配置 */
  audience?: {
    /** 受众大小（联系人数量） */
    size: number;
    /** 筛选条件 */
    filters?: Record<string, any>;
  };
  /** 测试持续时间（小时） */
  durationHours: number;
  /** 采样率（0-1） */
  samplingRate: number;
  /** 置信水平（0-1） */
  confidenceLevel: number;
  /** 最小可检测效应（0-1） */
  minimumDetectableEffect: number;
  /** 是否启用 */
  enabled: boolean;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 状态 */
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  /** 创建时间 */
  createdAt: string;
  /** 最后更新时间 */
  updatedAt: string;
}

export interface ABTestVariant {
  /** 变体ID */
  variantId: string;
  /** 变体名称 */
  name: string;
  /** 变体描述 */
  description: string;
  /** 变体配置 */
  config: Record<string, any>;
  /** 权重（0-1） */
  weight: number;
  /** 是否为控制组 */
  isControl: boolean;
}

export interface ABTestAssignment {
  /** 分配ID */
  assignmentId: string;
  /** 测试ID */
  testId: string;
  /** 变体ID */
  variantId: string;
  /** 资源ID（联系人、任务等） */
  resourceId: string;
  /** 资源类型 */
  resourceType: 'contact' | 'job' | 'template' | 'campaign';
  /** 分配时间 */
  assignedAt: string;
  /** 是否曝光 */
  exposed: boolean;
  /** 曝光时间 */
  exposedAt?: string;
  /** 是否转化 */
  converted: boolean;
  /** 转化时间 */
  convertedAt?: string;
  /** 转化值 */
  conversionValue?: number;
}

export interface ABTestResult {
  /** 测试ID */
  testId: string;
  /** 结果计算时间 */
  calculatedAt: string;
  /** 总曝光数 */
  totalExposures: number;
  /** 总转化数 */
  totalConversions: number;
  /** 总体转化率 */
  overallConversionRate: number;
  /** 变体结果 */
  variantResults: ABTestVariantResult[];
  /** 统计显著性 */
  statisticalSignificance: {
    /** 是否显著 */
    isSignificant: boolean;
    /** p值 */
    pValue: number;
    /** 置信区间 */
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    /** 效应大小 */
    effectSize: number;
  };
  /** 获胜变体 */
  winner?: {
    variantId: string;
    confidence: number;
    improvement: number;
  };
  /** 建议 */
  recommendations: string[];
}

export interface ABTestVariantResult {
  /** 变体ID */
  variantId: string;
  /** 曝光数 */
  exposures: number;
  /** 转化数 */
  conversions: number;
  /** 转化率 */
  conversionRate: number;
  /** 转化率标准误差 */
  standardError: number;
  /** 置信区间 */
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  /** 相对提升（与控制组相比） */
  relativeImprovement?: number;
}

export interface ABTestEvent {
  /** 事件ID */
  eventId: string;
  /** 测试ID */
  testId: string;
  /** 变体ID */
  variantId: string;
  /** 资源ID */
  resourceId: string;
  /** 事件类型 */
  eventType: 'exposure' | 'conversion' | 'click' | 'open' | 'reply';
  /** 事件时间 */
  eventTime: string;
  /** 事件数据 */
  eventData?: Record<string, any>;
}

/**
 * A/B测试框架
 */
export class ABTestingFramework {
  private tests: Map<string, ABTestConfig> = new Map();
  private assignments: Map<string, ABTestAssignment> = new Map();
  private events: ABTestEvent[] = [];
  private maxEvents: number = 100000;
  
  constructor() {
    // 初始化模拟测试
    this.initializeSampleTests();
  }
  
  /**
   * 初始化示例测试
   */
  private initializeSampleTests(): void {
    const sampleTest: ABTestConfig = {
      testId: 'subject-line-test-1',
      name: '邮件主题行A/B测试',
      description: '测试不同主题行对打开率的影响',
      element: 'subject',
      goal: 'open-rate',
      variants: [
        {
          variantId: 'control',
          name: '控制组',
          description: '原始主题行',
          config: { subject: '关于合作机会的咨询' },
          weight: 0.5,
          isControl: true,
        },
        {
          variantId: 'variant-a',
          name: '变体A',
          description: '个性化主题行',
          config: { subject: '{公司名}的合作机会' },
          weight: 0.25,
          isControl: false,
        },
        {
          variantId: 'variant-b',
          name: '变体B',
          description: '问题式主题行',
          config: { subject: '希望与{公司名}探讨物流合作？' },
          weight: 0.25,
          isControl: false,
        },
      ],
      audience: {
        size: 1000,
        filters: { minDataQuality: 'B' },
      },
      durationHours: 48,
      samplingRate: 0.5,
      confidenceLevel: 0.95,
      minimumDetectableEffect: 0.1,
      enabled: true,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.tests.set(sampleTest.testId, sampleTest);
  }
  
  /**
   * 创建A/B测试
   */
  createTest(config: Omit<ABTestConfig, 'testId' | 'createdAt' | 'updatedAt' | 'status'>): ABTestConfig {
    const testId = this.generateTestId(config.name);
    const now = new Date().toISOString();
    
    const test: ABTestConfig = {
      ...config,
      testId,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    
    this.tests.set(testId, test);
    return test;
  }
  
  /**
   * 生成测试ID
   */
  private generateTestId(name: string): string {
    const baseId = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = Date.now().toString(36);
    return `${baseId}-${timestamp}`;
  }
  
  /**
   * 获取测试
   */
  getTest(testId: string): ABTestConfig | undefined {
    return this.tests.get(testId);
  }
  
  /**
   * 获取所有测试
   */
  getAllTests(options?: {
    status?: ABTestConfig['status'];
    enabled?: boolean;
  }): ABTestConfig[] {
    let tests = Array.from(this.tests.values());
    
    if (options?.status) {
      tests = tests.filter(test => test.status === options.status);
    }
    
    if (options?.enabled !== undefined) {
      tests = tests.filter(test => test.enabled === options.enabled);
    }
    
    return tests.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
  
  /**
   * 更新测试
   */
  updateTest(testId: string, updates: Partial<ABTestConfig>): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;
    
    const updatedTest: ABTestConfig = {
      ...test,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.tests.set(testId, updatedTest);
    return true;
  }
  
  /**
   * 启动测试
   */
  startTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;
    
    if (test.status !== 'draft' && test.status !== 'paused') {
      return false;
    }
    
    const now = new Date().toISOString();
    
    test.status = 'active';
    test.startTime = now;
    test.endTime = new Date(Date.now() + test.durationHours * 60 * 60 * 1000).toISOString();
    test.updatedAt = now;
    
    this.tests.set(testId, test);
    return true;
  }
  
  /**
   * 暂停测试
   */
  pauseTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'active') return false;
    
    test.status = 'paused';
    test.updatedAt = new Date().toISOString();
    
    this.tests.set(testId, test);
    return true;
  }
  
  /**
   * 完成测试
   */
  completeTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;
    
    test.status = 'completed';
    test.endTime = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    
    this.tests.set(testId, test);
    return true;
  }
  
  /**
   * 分配变体
   */
  assignVariant(
    testId: string,
    resourceId: string,
    resourceType: ABTestAssignment['resourceType']
  ): ABTestAssignment | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'active') {
      return null;
    }
    
    // 检查是否已分配
    const existingAssignment = this.findAssignment(testId, resourceId, resourceType);
    if (existingAssignment) {
      return existingAssignment;
    }
    
    // 应用采样率
    if (Math.random() > test.samplingRate) {
      return null;
    }
    
    // 根据权重选择变体
    const variant = this.selectVariantByWeight(test.variants);
    if (!variant) {
      return null;
    }
    
    const assignmentId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const assignment: ABTestAssignment = {
      assignmentId,
      testId,
      variantId: variant.variantId,
      resourceId,
      resourceType,
      assignedAt: now,
      exposed: false,
      converted: false,
    };
    
    this.assignments.set(assignmentId, assignment);
    return assignment;
  }
  
  /**
   * 根据权重选择变体
   */
  private selectVariantByWeight(variants: ABTestVariant[]): ABTestVariant | null {
    if (variants.length === 0) return null;
    
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    const randomValue = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (randomValue <= cumulativeWeight) {
        return variant;
      }
    }
    
    return variants[variants.length - 1];
  }
  
  /**
   * 查找分配记录
   */
  private findAssignment(
    testId: string,
    resourceId: string,
    resourceType: string
  ): ABTestAssignment | undefined {
    return Array.from(this.assignments.values()).find(assignment => 
      assignment.testId === testId &&
      assignment.resourceId === resourceId &&
      assignment.resourceType === resourceType
    );
  }
  
  /**
   * 记录曝光事件
   */
  recordExposure(
    testId: string,
    resourceId: string,
    resourceType: ABTestAssignment['resourceType']
  ): boolean {
    const assignment = this.findAssignment(testId, resourceId, resourceType);
    if (!assignment || assignment.exposed) {
      return false;
    }
    
    assignment.exposed = true;
    assignment.exposedAt = new Date().toISOString();
    this.assignments.set(assignment.assignmentId, assignment);
    
    // 记录事件
    this.recordEvent({
      eventId: crypto.randomUUID(),
      testId,
      variantId: assignment.variantId,
      resourceId,
      eventType: 'exposure',
      eventTime: assignment.exposedAt,
    });
    
    return true;
  }
  
  /**
   * 记录转化事件
   */
  recordConversion(
    testId: string,
    resourceId: string,
    resourceType: ABTestAssignment['resourceType'],
    conversionValue?: number
  ): boolean {
    const assignment = this.findAssignment(testId, resourceId, resourceType);
    if (!assignment || !assignment.exposed || assignment.converted) {
      return false;
    }
    
    assignment.converted = true;
    assignment.convertedAt = new Date().toISOString();
    assignment.conversionValue = conversionValue;
    this.assignments.set(assignment.assignmentId, assignment);
    
    // 记录事件
    this.recordEvent({
      eventId: crypto.randomUUID(),
      testId,
      variantId: assignment.variantId,
      resourceId,
      eventType: 'conversion',
      eventTime: assignment.convertedAt,
      eventData: { conversionValue },
    });
    
    return true;
  }
  
  /**
   * 记录事件
   */
  private recordEvent(event: ABTestEvent): void {
    this.events.unshift(event);
    
    // 限制事件数量
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
  }
  
  /**
   * 获取测试结果
   */
  getTestResults(testId: string): ABTestResult | null {
    const test = this.tests.get(testId);
    if (!test) return null;
    
    // 获取该测试的所有分配记录
    const testAssignments = Array.from(this.assignments.values()).filter(
      assignment => assignment.testId === testId
    );
    
    // 获取该测试的所有事件
    const testEvents = this.events.filter(event => event.testId === testId);
    
    // 按变体分组
    const variantGroups = new Map<string, ABTestAssignment[]>();
    
    testAssignments.forEach(assignment => {
      if (!variantGroups.has(assignment.variantId)) {
        variantGroups.set(assignment.variantId, []);
      }
      variantGroups.get(assignment.variantId)!.push(assignment);
    });
    
    // 计算变体结果
    const variantResults: ABTestVariantResult[] = [];
    const controlVariant = test.variants.find(v => v.isControl);
    
    for (const [variantId, assignments] of variantGroups.entries()) {
      const exposures = assignments.filter(a => a.exposed).length;
      const conversions = assignments.filter(a => a.converted).length;
      const conversionRate = exposures > 0 ? conversions / exposures : 0;
      
      // 计算标准误差
      const standardError = this.calculateStandardError(conversions, exposures);
      
      // 计算置信区间
      const confidenceInterval = this.calculateConfidenceInterval(
        conversionRate,
        standardError,
        test.confidenceLevel
      );
      
      const variantResult: ABTestVariantResult = {
        variantId,
        exposures,
        conversions,
        conversionRate,
        standardError,
        confidenceInterval,
      };
      
      // 计算相对提升（与控制组相比）
      if (controlVariant && variantId !== controlVariant.variantId) {
        const controlAssignments = variantGroups.get(controlVariant.variantId) || [];
        const controlExposures = controlAssignments.filter(a => a.exposed).length;
        const controlConversions = controlAssignments.filter(a => a.converted).length;
        const controlConversionRate = controlExposures > 0 ? controlConversions / controlExposures : 0;
        
        if (controlConversionRate > 0) {
          variantResult.relativeImprovement = (conversionRate - controlConversionRate) / controlConversionRate;
        }
      }
      
      variantResults.push(variantResult);
    }
    
    // 计算统计显著性
    const statisticalSignificance = this.calculateStatisticalSignificance(variantResults, test);
    
    // 确定获胜者
    let winner = undefined;
    if (statisticalSignificance.isSignificant && controlVariant) {
      const controlResult = variantResults.find(r => r.variantId === controlVariant.variantId);
      const treatmentResults = variantResults.filter(r => r.variantId !== controlVariant.variantId);
      
      if (controlResult && treatmentResults.length > 0) {
        // 找到表现最好的变体
        const bestTreatment = treatmentResults.reduce((best, current) => {
          return (current.conversionRate > best.conversionRate) ? current : best;
        });
        
        if (bestTreatment.conversionRate > controlResult.conversionRate) {
          const improvement = bestTreatment.conversionRate - controlResult.conversionRate;
          const confidence = 1 - statisticalSignificance.pValue;
          
          winner = {
            variantId: bestTreatment.variantId,
            confidence,
            improvement,
          };
        }
      }
    }
    
    // 生成建议
    const recommendations = this.generateRecommendations(test, variantResults, statisticalSignificance, winner);
    
    // 计算总体指标
    const totalExposures = variantResults.reduce((sum, r) => sum + r.exposures, 0);
    const totalConversions = variantResults.reduce((sum, r) => sum + r.conversions, 0);
    const overallConversionRate = totalExposures > 0 ? totalConversions / totalExposures : 0;
    
    const result: ABTestResult = {
      testId,
      calculatedAt: new Date().toISOString(),
      totalExposures,
      totalConversions,
      overallConversionRate,
      variantResults,
      statisticalSignificance,
      winner,
      recommendations,
    };
    
    return result;
  }
  
  /**
   * 计算标准误差
   */
  private calculateStandardError(conversions: number, exposures: number): number {
    if (exposures === 0) return 0;
    
    const p = conversions / exposures;
    return Math.sqrt((p * (1 - p)) / exposures);
  }
  
  /**
   * 计算置信区间
   */
  private calculateConfidenceInterval(
    proportion: number,
    standardError: number,
    confidenceLevel: number
  ): { lower: number; upper: number } {
    // Z值（95%置信水平为1.96，90%为1.645）
    const zScore = confidenceLevel === 0.95 ? 1.96 : 
                   confidenceLevel === 0.99 ? 2.576 : 
                   confidenceLevel === 0.90 ? 1.645 : 1.96;
    
    const marginOfError = zScore * standardError;
    
    return {
      lower: Math.max(0, proportion - marginOfError),
      upper: Math.min(1, proportion + marginOfError),
    };
  }
  
  /**
   * 计算统计显著性
   */
  private calculateStatisticalSignificance(
    variantResults: ABTestVariantResult[],
    test: ABTestConfig
  ): ABTestResult['statisticalSignificance'] {
    if (variantResults.length < 2) {
      return {
        isSignificant: false,
        pValue: 1,
        confidenceInterval: { lower: 0, upper: 0 },
        effectSize: 0,
      };
    }
    
    const controlVariant = test.variants.find(v => v.isControl);
    const treatmentVariants = test.variants.filter(v => !v.isControl);
    
    if (!controlVariant || treatmentVariants.length === 0) {
      return {
        isSignificant: false,
        pValue: 1,
        confidenceInterval: { lower: 0, upper: 0 },
        effectSize: 0,
      };
    }
    
    const controlResult = variantResults.find(r => r.variantId === controlVariant.variantId);
    const treatmentResult = variantResults.find(r => r.variantId === treatmentVariants[0].variantId);
    
    if (!controlResult || !treatmentResult) {
      return {
        isSignificant: false,
        pValue: 1,
        confidenceInterval: { lower: 0, upper: 0 },
        effectSize: 0,
      };
    }
    
    // 简化计算：使用卡方检验（近似）
    const pValue = this.calculateChiSquarePValue(
      controlResult.conversions,
      controlResult.exposures - controlResult.conversions,
      treatmentResult.conversions,
      treatmentResult.exposures - treatmentResult.conversions
    );
    
    // 计算效应大小
    const effectSize = treatmentResult.conversionRate - controlResult.conversionRate;
    
    // 计算置信区间
    const pooledProportion = (controlResult.conversions + treatmentResult.conversions) / 
                            (controlResult.exposures + treatmentResult.exposures);
    const pooledSE = Math.sqrt(
      pooledProportion * (1 - pooledProportion) * 
      (1/controlResult.exposures + 1/treatmentResult.exposures)
    );
    
    const zScore = test.confidenceLevel === 0.95 ? 1.96 : 
                   test.confidenceLevel === 0.99 ? 2.576 : 
                   test.confidenceLevel === 0.90 ? 1.645 : 1.96;
    
    const marginOfError = zScore * pooledSE;
    
    return {
      isSignificant: pValue < (1 - test.confidenceLevel),
      pValue,
      confidenceInterval: {
        lower: effectSize - marginOfError,
        upper: effectSize + marginOfError,
      },
      effectSize,
    };
  }
  
  /**
   * 计算卡方检验p值（简化版）
   */
  private calculateChiSquarePValue(
    a: number, b: number,
    c: number, d: number
  ): number {
    // 计算卡方值
    const n = a + b + c + d;
    const expectedA = (a + b) * (a + c) / n;
    const expectedB = (a + b) * (b + d) / n;
    const expectedC = (c + d) * (a + c) / n;
    const expectedD = (c + d) * (b + d) / n;
    
    const chiSquare = 
      Math.pow(a - expectedA, 2) / expectedA +
      Math.pow(b - expectedB, 2) / expectedB +
      Math.pow(c - expectedC, 2) / expectedC +
      Math.pow(d - expectedD, 2) / expectedD;
    
    // 简化：返回近似p值（单自由度）
    // 实际实现应使用统计库
    if (chiSquare > 6.635) return 0.01;
    if (chiSquare > 3.841) return 0.05;
    if (chiSquare > 2.706) return 0.10;
    return 0.50;
  }
  
  /**
   * 生成建议
   */
  private generateRecommendations(
    test: ABTestConfig,
    variantResults: ABTestVariantResult[],
    statisticalSignificance: ABTestResult['statisticalSignificance'],
    winner?: ABTestResult['winner']
  ): string[] {
    const recommendations: string[] = [];
    
    if (test.status === 'active') {
      const totalExposures = variantResults.reduce((sum, r) => sum + r.exposures, 0);
      const targetExposures = test.audience?.size || 1000;
      
      if (totalExposures < targetExposures * 0.5) {
        recommendations.push('测试样本量不足，建议继续收集数据');
      } else if (totalExposures >= targetExposures) {
        recommendations.push('已达到目标样本量，可以考虑结束测试');
      }
    }
    
    if (statisticalSignificance.isSignificant) {
      if (winner) {
        recommendations.push(`变体"${winner.variantId}"表现显著优于控制组，提升${(winner.improvement * 100).toFixed(1)}%`);
        recommendations.push(`建议采用获胜变体"${winner.variantId}"`);
      } else {
        recommendations.push('检测到显著差异，但无明确获胜者');
      }
    } else {
      recommendations.push('未检测到显著差异，变体间表现相似');
      
      if (variantResults.length > 0) {
        const bestVariant = variantResults.reduce((best, current) => {
          return (current.conversionRate > best.conversionRate) ? current : best;
        });
        
        if (bestVariant.conversionRate > 0) {
          recommendations.push(`变体"${bestVariant.variantId}"表现最好，但差异不显著`);
        }
      }
    }
    
    // 检查置信区间重叠
    const controlVariant = test.variants.find(v => v.isControl);
    if (controlVariant) {
      const controlResult = variantResults.find(r => r.variantId === controlVariant.variantId);
      const treatmentResults = variantResults.filter(r => r.variantId !== controlVariant.variantId);
      
      treatmentResults.forEach(treatment => {
        if (controlResult && 
            treatment.confidenceInterval.upper < controlResult.confidenceInterval.lower) {
          recommendations.push(`变体"${treatment.variantId}"可能表现不如控制组`);
        }
      });
    }
    
    return recommendations;
  }
  
  /**
   * 获取测试事件
   */
  getTestEvents(testId: string, options?: {
    eventType?: ABTestEvent['eventType'];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): ABTestEvent[] {
    let events = this.events.filter(event => event.testId === testId);
    
    if (options?.eventType) {
      events = events.filter(event => event.eventType === options.eventType);
    }
    
    if (options?.startDate) {
      const start = new Date(options.startDate);
      events = events.filter(event => new Date(event.eventTime) >= start);
    }
    
    if (options?.endDate) {
      const end = new Date(options.endDate);
      events = events.filter(event => new Date(event.eventTime) <= end);
    }
    
    if (options?.limit) {
      events = events.slice(0, options.limit);
    }
    
    return events;
  }
  
  /**
   * 清除旧数据
   */
  cleanupOldData(maxAgeDays: number = 180): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);
    
    // 清除旧事件
    this.events = this.events.filter(event => {
      return new Date(event.eventTime) >= cutoff;
    });
    
    // 清除已完成的旧测试
    for (const [testId, test] of this.tests.entries()) {
      if (test.status === 'completed' && test.endTime) {
        const endTime = new Date(test.endTime);
        if (endTime < cutoff) {
          test.status = 'archived';
          this.tests.set(testId, test);
        }
      }
    }
    
    console.log(`[ABTestingFramework] Cleaned up data older than ${maxAgeDays} days`);
  }
}

// 默认导出单例
export const abTestingFramework = new ABTestingFramework();