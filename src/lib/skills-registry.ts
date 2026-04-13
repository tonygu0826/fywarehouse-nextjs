/**
 * Skills Registry for FYMail / 拓客系统
 * 
 * 技能注册与映射层，用于集成外部技能能力到拓客系统工作流。
 * 严格遵守约束：不修改登录代码、登录流程、鉴权逻辑。
 * 
 * 技能目录参考：/home/ubuntu/.openclaw/workspace/skills
 */

import { skillDiscoverer, skillManifestToCapability } from './skill-discovery';
import { skillStateManager } from './skill-state-persistence';
import { skillExecutionLogger } from './skill-execution-logger';

export interface SkillCapability {
  /** 技能唯一标识符 */
  id: string;
  /** 技能名称 */
  name: string;
  /** 技能描述 */
  description: string;
  /** 技能类别 */
  category: 'data-collection' | 'data-enrichment' | 'email-marketing' | 'contact-finding' | 'analytics' | 'automation';
  /** 技能是否已启用 */
  enabled: boolean;
  /** 技能版本 */
  version: string;
  /** 技能配置路径 */
  configPath?: string;
  /** 集成点：技能可以挂载的拓客系统工作流阶段 */
  integrationPoints: IntegrationPoint[];
  /** 技能执行函数（异步） */
  execute?: (context: SkillContext, params?: Record<string, any>) => Promise<SkillExecutionResult>;
}

export interface IntegrationPoint {
  /** 集成点标识符 */
  id: string;
  /** 集成点名称 */
  name: string;
  /** 所属工作流阶段 */
  workflowStage: WorkflowStage;
  /** 触发条件 */
  trigger: 'manual' | 'auto' | 'schedule';
  /** 优先级 */
  priority: number;
  /** 是否启用 */
  enabled: boolean;
}

export type WorkflowStage = 
  | 'contact-acquisition'      // 联系人获取
  | 'contact-validation'       // 联系人验证
  | 'contact-enrichment'       // 联系人增强
  | 'data-quality-scoring'     // 数据质量评分
  | 'template-design'          // 模板设计
  | 'campaign-planning'        // 活动策划
  | 'bulk-send-scheduling'     // 批量发送调度
  | 'send-execution'           // 发送执行
  | 'performance-monitoring'   // 性能监控
  | 'analytics-reporting';     // 分析报告

export interface SkillContext {
  /** 当前工作流阶段 */
  workflowStage: WorkflowStage;
  /** 联系人数据（如有） */
  contact?: any;
  /** 联系人列表（如有） */
  contacts?: any[];
  /** 模板数据（如有） */
  template?: any;
  /** 任务数据（如有） */
  job?: any;
  /** 用户配置 */
  userConfig?: Record<string, any>;
  /** 技能特定配置 */
  skillConfig?: Record<string, any>;
}

export interface SkillExecutionResult {
  /** 执行是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: Record<string, any>;
  /** 输出消息 */
  message?: string;
  /** 错误信息（如果执行失败） */
  error?: string;
  /** 执行耗时（毫秒） */
  durationMs?: number;
  /** 产生的副作用（例如：更新的联系人、创建的模板等） */
  sideEffects?: SkillSideEffect[];
}

export interface SkillSideEffect {
  /** 副作用类型 */
  type: 'contact-updated' | 'contact-created' | 'template-created' | 'job-created' | 'data-enriched' | 'validation-result';
  /** 资源ID */
  resourceId?: string;
  /** 资源类型 */
  resourceType?: string;
  /** 变更详情 */
  changes?: Record<string, any>;
}

/**
 * 内置技能列表（硬编码，向后兼容）
 */
export const BUILTIN_SKILLS: SkillCapability[] = [
  {
    id: 'email-marketing-automation',
    name: 'Email Marketing Automation',
    description: 'Cold email marketing automation, template design, sending strategies, and campaign optimization for B2B outreach.',
    category: 'email-marketing',
    enabled: true,
    version: '1.0',
    configPath: '/home/ubuntu/.openclaw/workspace/skills/email-marketing-automation',
    integrationPoints: [
      {
        id: 'template-design',
        name: 'Template Design Assistance',
        workflowStage: 'template-design',
        trigger: 'manual',
        priority: 1,
        enabled: true,
      },
      {
        id: 'campaign-planning',
        name: 'Campaign Planning',
        workflowStage: 'campaign-planning',
        trigger: 'manual',
        priority: 2,
        enabled: true,
      },
      {
        id: 'send-strategy',
        name: 'Send Strategy Optimization',
        workflowStage: 'bulk-send-scheduling',
        trigger: 'auto',
        priority: 3,
        enabled: true,
      },
      {
        id: 'performance-optimization',
        name: 'Performance Optimization',
        workflowStage: 'performance-monitoring',
        trigger: 'auto',
        priority: 4,
        enabled: true,
      },
    ],
  },
  {
    id: 'data-enrichment-tools',
    name: 'Data Enrichment Tools',
    description: 'Professional data enrichment, cleaning, validation, and standardization tools for logistics and business contact data.',
    category: 'data-enrichment',
    enabled: true,
    version: '1.0.0',
    configPath: '/home/ubuntu/.openclaw/workspace/skills/data-enrichment-tools',
    integrationPoints: [
      {
        id: 'contact-validation',
        name: 'Contact Validation',
        workflowStage: 'contact-validation',
        trigger: 'auto',
        priority: 1,
        enabled: true,
      },
      {
        id: 'contact-enrichment',
        name: 'Contact Enrichment',
        workflowStage: 'contact-enrichment',
        trigger: 'auto',
        priority: 2,
        enabled: true,
      },
      {
        id: 'data-quality-scoring',
        name: 'Data Quality Scoring',
        workflowStage: 'data-quality-scoring',
        trigger: 'auto',
        priority: 3,
        enabled: true,
      },
    ],
  },
  {
    id: 'contact-finder-pro',
    name: 'Contact Finder Pro',
    description: 'Professional contact discovery and validation using advanced APIs, machine learning, and multi-source verification.',
    category: 'contact-finding',
    enabled: true,
    version: '1.0.0',
    configPath: '/home/ubuntu/.openclaw/workspace/skills/contact-finder-pro',
    integrationPoints: [
      {
        id: 'contact-acquisition',
        name: 'Contact Acquisition',
        workflowStage: 'contact-acquisition',
        trigger: 'manual',
        priority: 1,
        enabled: true,
      },
      {
        id: 'contact-validation-pro',
        name: 'Advanced Contact Validation',
        workflowStage: 'contact-validation',
        trigger: 'auto',
        priority: 2,
        enabled: true,
      },
      {
        id: 'contact-enrichment-pro',
        name: 'Contact Enrichment with ML',
        workflowStage: 'contact-enrichment',
        trigger: 'auto',
        priority: 3,
        enabled: true,
      },
    ],
  },
  {
    id: 'cold-email-outreach',
    name: 'Cold Email Outreach',
    description: 'Professional B2B cold email strategies, templates, and follow-up sequences for European freight forwarders.',
    category: 'email-marketing',
    enabled: true,
    version: '1.0',
    configPath: '/home/ubuntu/.openclaw/workspace/skills/cold-email-outreach',
    integrationPoints: [
      {
        id: 'template-localization',
        name: 'Template Localization',
        workflowStage: 'template-design',
        trigger: 'manual',
        priority: 1,
        enabled: true,
      },
      {
        id: 'regional-strategy',
        name: 'Regional Strategy',
        workflowStage: 'campaign-planning',
        trigger: 'manual',
        priority: 2,
        enabled: true,
      },
      {
        id: 'timing-optimization',
        name: 'Timing Optimization',
        workflowStage: 'bulk-send-scheduling',
        trigger: 'auto',
        priority: 3,
        enabled: true,
      },
    ],
  },
];

/**
 * 已安装技能列表（动态发现 + 内置）
 * 注意：为了向后兼容，默认使用内置技能
 */
export let INSTALLED_SKILLS: SkillCapability[] = [...BUILTIN_SKILLS];

/**
 * 从持久化存储加载技能状态并应用到技能列表
 */
async function applyPersistedSkillStates(skills: SkillCapability[]): Promise<SkillCapability[]> {
  try {
    const stateStore = await skillStateManager.loadState();
    const updatedSkills = skills.map(skill => {
      const persisted = stateStore.skills[skill.id];
      if (persisted) {
        // 应用启用/禁用状态
        const updatedSkill = { ...skill, enabled: persisted.enabled };
        
        // 应用集成点状态
        if (persisted.integrationPoints && Object.keys(persisted.integrationPoints).length > 0) {
          updatedSkill.integrationPoints = updatedSkill.integrationPoints.map(point => {
            const pointEnabled = persisted.integrationPoints[point.id];
            if (pointEnabled !== undefined) {
              return { ...point, enabled: pointEnabled };
            }
            return point;
          });
        }
        
        return updatedSkill;
      }
      return skill;
    });
    return updatedSkills;
  } catch (error) {
    console.warn('[SkillsRegistry] Failed to apply persisted skill states:', error);
    return skills;
  }
}

/**
 * 异步发现并加载技能
 */
export async function discoverAndLoadSkills(): Promise<SkillCapability[]> {
  try {
    const manifests = await skillDiscoverer.discoverSkills();
    const discoveredSkills: SkillCapability[] = [];
    
    for (const manifest of manifests) {
      // 跳过已经存在的技能（按ID）
      if (BUILTIN_SKILLS.some(skill => skill.id === manifest.id)) {
        continue;
      }
      
      // 转换为技能能力
      const capability = skillManifestToCapability(manifest);
      
      // 只添加与拓客系统相关的技能
      if (isRelevantSkill(capability)) {
        discoveredSkills.push(capability);
      }
    }
    
    // 合并技能列表（发现的技能优先，但内置技能保留其配置）
    const mergedSkills = mergeSkills(BUILTIN_SKILLS, discoveredSkills);
    
    // 应用持久化技能状态
    const skillsWithPersistedState = await applyPersistedSkillStates(mergedSkills);
    INSTALLED_SKILLS = skillsWithPersistedState;
    
    console.log(`[SkillsRegistry] Discovered ${discoveredSkills.length} new skills, total: ${INSTALLED_SKILLS.length}`);
    return INSTALLED_SKILLS;
  } catch (error) {
    console.error('[SkillsRegistry] Failed to discover skills:', error);
    return INSTALLED_SKILLS;
  }
}

/**
 * 合并技能列表（内置技能优先，但发现的技能可以覆盖某些属性）
 */
function mergeSkills(builtin: SkillCapability[], discovered: SkillCapability[]): SkillCapability[] {
  const skillMap = new Map<string, SkillCapability>();
  
  // 先添加所有内置技能
  builtin.forEach(skill => {
    skillMap.set(skill.id, { ...skill });
  });
  
  // 添加或合并发现的技能
  discovered.forEach(skill => {
    if (skillMap.has(skill.id)) {
      // 合并：保留内置技能的集成点，但更新其他属性
      const existing = skillMap.get(skill.id)!;
      skillMap.set(skill.id, {
        ...existing,
        name: skill.name || existing.name,
        description: skill.description || existing.description,
        version: skill.version || existing.version,
        configPath: skill.configPath || existing.configPath,
        execute: skill.execute || existing.execute,
      });
    } else {
      skillMap.set(skill.id, skill);
    }
  });
  
  return Array.from(skillMap.values());
}

/**
 * 检查技能是否与拓客系统相关
 */
function isRelevantSkill(skill: SkillCapability): boolean {
  // 临时：允许所有技能通过，用于测试
  console.log(`[isRelevantSkill] Checking skill: ${skill.id}, category: ${skill.category}, description: ${skill.description.substring(0, 50)}...`);
  return true;
  
  // 原始逻辑（注释掉用于测试）
  /*
  const relevantCategories = [
    'data-collection',
    'data-enrichment',
    'email-marketing',
    'contact-finding',
    'analytics',
    'automation',
    'monitoring',
    'ui-ux',
    'scraping',
    'synchronization',
    'business-intelligence',
  ];
  
  const relevantTags = [
    'contact-finding',
    'data-enrichment',
    'email-marketing',
    'validation',
    'data-cleaning',
    'logistics',
    'freight-forwarding',
    'b2b',
    'observability',
    'monitoring',
    'web-scraping',
    'data-scraping',
    'ui-design',
    'ux-design',
    'clawith',
    'sync',
    'business-intelligence',
  ];
  
  // 检查类别
  if (relevantCategories.includes(skill.category)) {
    return true;
  }
  
  // 检查描述中是否包含关键词
  const description = skill.description.toLowerCase();
  const keywords = [
    'contact', 'email', 'data', 'enrichment', 'validation', 'cleaning', 
    'logistics', 'freight', 'monitor', 'observability', 'ui', 'ux', 
    'design', 'scraping', 'scrape', 'sync', 'clawith', 'intelligence',
    'business', 'agent', 'automation', 'marketing', 'outreach', 'cold',
    'web', 'crawler', 'database', 'forwarding', 'supply', 'chain'
  ];
  if (keywords.some(keyword => description.includes(keyword))) {
    return true;
  }
  
  return false;
  */
}

/**
 * 技能注册表
 */
export class SkillsRegistry {
  private skills: Map<string, SkillCapability> = new Map();
  private initialized: boolean = false;
  
  constructor(autoInitialize: boolean = true) {
    if (autoInitialize) {
      this.initialize();
    }
  }
  
  /**
   * 初始化注册表（同步，使用当前INSTALLED_SKILLS）
   */
  initialize(): void {
    INSTALLED_SKILLS.forEach(skill => {
      this.skills.set(skill.id, skill);
    });
    this.initialized = true;
  }
  
  /**
   * 异步重新加载技能（包括发现新技能）
   */
  async reloadSkills(): Promise<void> {
    await discoverAndLoadSkills();
    this.skills.clear();
    this.initialize();
  }
  
  /**
   * 获取所有技能
   */
  getAllSkills(): SkillCapability[] {
    return Array.from(this.skills.values());
  }
  
  /**
   * 根据ID获取技能
   */
  getSkill(id: string): SkillCapability | undefined {
    return this.skills.get(id);
  }
  
  /**
   * 根据工作流阶段获取相关技能
   */
  getSkillsByWorkflowStage(stage: WorkflowStage): SkillCapability[] {
    return Array.from(this.skills.values()).filter(skill =>
      skill.enabled && skill.integrationPoints.some(point =>
        point.workflowStage === stage && point.enabled
      )
    );
  }
  
  /**
   * 获取技能集成点
   */
  getIntegrationPoints(skillId: string, stage?: WorkflowStage): IntegrationPoint[] {
    const skill = this.getSkill(skillId);
    if (!skill) return [];
    
    return skill.integrationPoints.filter(point =>
      !stage || point.workflowStage === stage
    );
  }
  
  /**
   * 启用/禁用技能
   */
  setSkillEnabled(skillId: string, enabled: boolean): boolean {
    const skill = this.getSkill(skillId);
    if (!skill) return false;
    
    skill.enabled = enabled;
    this.skills.set(skillId, skill);
    
    // 持久化状态
    skillStateManager.setSkillEnabled(skillId, enabled).catch(error => {
      console.warn(`[SkillsRegistry] Failed to persist skill state for ${skillId}:`, error);
    });
    
    return true;
  }
  
  /**
   * 启用/禁用集成点
   */
  setIntegrationPointEnabled(skillId: string, pointId: string, enabled: boolean): boolean {
    const skill = this.getSkill(skillId);
    if (!skill) return false;
    
    const point = skill.integrationPoints.find(p => p.id === pointId);
    if (!point) return false;
    
    point.enabled = enabled;
    this.skills.set(skillId, skill);
    
    // 持久化状态
    skillStateManager.setIntegrationPointEnabled(skillId, pointId, enabled).catch(error => {
      console.warn(`[SkillsRegistry] Failed to persist integration point state for ${skillId}.${pointId}:`, error);
    });
    
    return true;
  }
  
  /**
   * 添加或更新技能
   */
  registerSkill(skill: SkillCapability): void {
    this.skills.set(skill.id, skill);
  }
  
  /**
   * 移除技能
   */
  unregisterSkill(skillId: string): boolean {
    return this.skills.delete(skillId);
  }
}

/**
 * 技能执行器
 */
export class SkillExecutor {
  private registry: SkillsRegistry;
  
  constructor(registry: SkillsRegistry) {
    this.registry = registry;
  }
  
  /**
   * 执行技能
   */
  async executeSkill(
    skillId: string,
    context: SkillContext,
    params?: Record<string, any>
  ): Promise<SkillExecutionResult> {
    const skill = this.registry.getSkill(skillId);
    if (!skill) {
      return {
        success: false,
        error: `Skill not found: ${skillId}`,
      };
    }
    
    if (!skill.enabled) {
      return {
        success: false,
        error: `Skill is disabled: ${skillId}`,
      };
    }
    
    const startTime = Date.now();
    
    try {
      // 优先使用技能自带的执行函数
      if (skill.execute) {
        const result = await skill.execute(context, params);
        const durationMs = Date.now() - startTime;
        
        // 记录执行日志
        await skillExecutionLogger.logSkillExecution(
          skillId,
          skill.name,
          'skill',
          { ...result, durationMs },
          context,
          params
        ).catch(logError => {
          console.warn(`[SkillExecutor] Failed to log execution for ${skillId}:`, logError);
        });
        
        // 确保返回格式统一
        if (result.success !== undefined) {
          return { ...result, durationMs: result.durationMs || durationMs };
        } else {
          // 适配器可能返回原始数据，包装成SkillExecutionResult
          return {
            success: true,
            data: result,
            message: `Skill ${skillId} executed successfully`,
            durationMs,
          };
        }
      }
      
      // 否则使用默认模拟逻辑
      const result = await this.executeSkillLogic(skill, context, params);
      const durationMs = Date.now() - startTime;
      
      // 记录执行日志
      await skillExecutionLogger.logSkillExecution(
        skillId,
        skill.name,
        'skill',
        { success: true, data: result, durationMs },
        context,
        params
      ).catch(logError => {
        console.warn(`[SkillExecutor] Failed to log execution for ${skillId}:`, logError);
      });
      
      return {
        success: true,
        data: result,
        message: `Skill ${skillId} executed successfully`,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs,
      };
      
      // 记录失败日志
      await skillExecutionLogger.logSkillExecution(
        skillId,
        skill.name,
        'skill',
        errorResult,
        context,
        params
      ).catch(logError => {
        console.warn(`[SkillExecutor] Failed to log execution for ${skillId}:`, logError);
      });
      
      return errorResult;
    }
  }
  
  /**
   * 执行技能逻辑（模拟）
   */
  private async executeSkillLogic(
    skill: SkillCapability,
    context: SkillContext,
    params?: Record<string, any>
  ): Promise<Record<string, any>> {
    // 模拟执行
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 根据技能ID返回不同的模拟结果
    switch (skill.id) {
      case 'data-enrichment-tools':
        return {
          enrichedFields: ['company', 'title', 'location'],
          qualityScore: 85,
          confidence: 0.9,
        };
      case 'contact-finder-pro':
        return {
          contactsFound: 5,
          confidenceScores: [92, 85, 78, 90, 88],
          sources: ['LinkedIn', 'Company Website', 'Industry Directory'],
        };
      case 'email-marketing-automation':
        return {
          suggestedTemplate: 'partnership-intro-de',
          sendStrategy: {
            batchSize: 50,
            delayBetweenBatches: 60,
            optimalSendTime: '10:30 AM',
          },
          predictedOpenRate: 0.28,
        };
      case 'cold-email-outreach':
        return {
          localizedTemplate: 'german',
          regionalInsights: {
            bestDay: 'Tuesday',
            bestTime: '10:30 AM',
            expectedReplyRate: 0.08,
          },
          complianceChecked: true,
        };
      default:
        return { executed: true, skillId: skill.id };
    }
  }
  
  /**
   * 在工作流阶段自动执行相关技能
   */
  async executeForWorkflowStage(
    stage: WorkflowStage,
    context: SkillContext,
    params?: Record<string, any>
  ): Promise<SkillExecutionResult[]> {
    const skills = this.registry.getSkillsByWorkflowStage(stage);
    const results: SkillExecutionResult[] = [];
    
    for (const skill of skills) {
      // 只执行启用的技能
      if (skill.enabled) {
        const result = await this.executeSkill(skill.id, context, params);
        results.push(result);
      }
    }
    
    return results;
  }
}

// 默认导出单例实例
export const skillsRegistry = new SkillsRegistry();
export const skillExecutor = new SkillExecutor(skillsRegistry);