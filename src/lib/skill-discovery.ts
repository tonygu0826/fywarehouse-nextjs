/**
 * Skill Discovery Module
 * 
 * 自动扫描技能目录，发现并加载可用技能。
 * 使用环境变量SKILLS_DIRECTORY或默认路径
 * 
 * 注意：为了兼容Next.js构建环境，此模块当前使用硬编码技能列表。
 * 生产环境中可能需要恢复文件系统扫描功能。
 */

// 移除fs/promises和path导入以避免构建错误
import { createExecuteFunctionFromAdapter } from './skill-adapters';

export interface SkillManifest {
  /** 技能唯一标识符 */
  id: string;
  /** 技能名称 */
  name: string;
  /** 技能描述 */
  description: string;
  /** 技能标签 */
  tags: string[];
  /** 技能类别 */
  category: string;
  /** 技能版本 */
  version: string;
  /** 技能目录路径 */
  directory: string;
  /** 技能配置文件路径 */
  configPath?: string;
  /** 执行脚本路径 */
  executeScript?: string;
}

/**
 * 技能发现器
 */
export class SkillDiscoverer {
  private skillsDir: string;
  
  constructor(skillsDir?: string) {
    // 使用环境变量或参数，最后使用默认值
    this.skillsDir = skillsDir || process.env.SKILLS_DIRECTORY || '/home/ubuntu/.openclaw/workspace/skills';
  }
  
  /**
   * 扫描技能目录并返回发现的技能
   * 
   * 注意：由于构建环境限制（fs模块不可用），当前返回硬编码技能列表。
   * 生产环境中可恢复文件系统扫描功能。
   */
  async discoverSkills(): Promise<SkillManifest[]> {
    // 硬编码技能列表（基于已知的技能目录）
    const manifests: SkillManifest[] = [
      {
        id: 'contact-finder-pro',
        name: 'Contact Finder Pro',
        description: '专业联系人查找工具，用于发现和验证商业联系人',
        tags: ['contact-finding', 'data-collection', 'lead-generation'],
        category: 'contact-finding',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/contact-finder-pro',
      },
      {
        id: 'data-enrichment-tools',
        name: 'Data Enrichment Tools',
        description: '数据增强工具，用于丰富和验证联系人信息',
        tags: ['data-enrichment', 'data-processing', 'validation'],
        category: 'data-enrichment',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/data-enrichment-tools',
      },
      {
        id: 'email-marketing-automation',
        name: 'Email Marketing Automation',
        description: '邮件营销自动化工具，用于模板设计和发送策略优化',
        tags: ['email-marketing', 'automation', 'campaign-management'],
        category: 'email-marketing',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/email-marketing-automation',
      },
      {
        id: 'cold-email-outreach',
        name: 'Cold Email Outreach',
        description: '冷邮件外展策略和模板设计工具',
        tags: ['cold-email', 'outreach', 'b2b'],
        category: 'email-marketing',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/cold-email-outreach',
      },
      {
        id: 'afrexai-agent-observability',
        name: 'Agent Observability',
        description: 'AI代理可观测性工具，用于监控和调试代理性能',
        tags: ['observability', 'monitoring', 'ai-agents'],
        category: 'monitoring',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/afrexai-agent-observability',
      },
      {
        id: 'ui-ux-design',
        name: 'UI/UX Design',
        description: '现代UI/UX设计原则、模式和最佳实践，适用于Web和移动应用',
        tags: ['ui-design', 'ux-design', 'web-design', 'responsive-design', 'accessibility'],
        category: 'ui-ux',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/ui-ux-design',
      },
      {
        id: 'web-scraping',
        name: 'Web Scraping',
        description: '网页数据抓取和提取工具，支持法律合规的爬取和数据收集',
        tags: ['web-scraping', 'data-scraping', 'data-collection', 'automation'],
        category: 'scraping',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/web-scraping',
      },
      {
        id: 'clawith_sync',
        name: 'Clawith Sync',
        description: '与Clawith平台同步，检查收件箱、提交结果、发送消息',
        tags: ['synchronization', 'clawith', 'integration', 'messaging'],
        category: 'synchronization',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/clawith_sync',
      },
      {
        id: 'business-intelligence-scraper',
        name: 'Business Intelligence Scraper',
        description: '商业情报数据抓取工具，用于收集市场数据和竞争对手信息',
        tags: ['business-intelligence', 'data-scraping', 'market-research', 'competitor-analysis'],
        category: 'business-intelligence',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/business-intelligence-scraper',
      },
      {
        id: 'freight-forwarding-database',
        name: 'Freight Forwarding Database',
        description: '货运代理数据库，包含物流公司和联系信息',
        tags: ['freight-forwarding', 'logistics', 'database', 'contact-finding'],
        category: 'data-collection',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/freight-forwarding-database',
      },
      {
        id: 'logistics-contact-finder',
        name: 'Logistics Contact Finder',
        description: '物流行业联系人查找工具，专门针对货运和供应链公司',
        tags: ['logistics', 'contact-finding', 'freight', 'supply-chain'],
        category: 'contact-finding',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/logistics-contact-finder',
      },
      {
        id: 'supply-chain-intelligence',
        name: 'Supply Chain Intelligence',
        description: '供应链情报工具，用于分析和监控供应链数据',
        tags: ['supply-chain', 'business-intelligence', 'analytics', 'monitoring'],
        category: 'business-intelligence',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/supply-chain-intelligence',
      },
      {
        id: 'web-scraping-professional',
        name: 'Web Scraping Professional',
        description: '专业网页爬取工具，支持高级数据提取和处理',
        tags: ['web-scraping', 'data-extraction', 'automation', 'data-processing'],
        category: 'scraping',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/web-scraping-professional',
      },
      {
        id: 'ai-data-scraper',
        name: 'AI Data Scraper',
        description: 'AI驱动的数据抓取工具，智能提取和处理网页数据',
        tags: ['ai', 'data-scraping', 'automation', 'data-processing'],
        category: 'scraping',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/ai-data-scraper',
      },
      {
        id: 'agent-id',
        name: 'Agent Identity',
        description: '代理身份管理和识别工具，为AI代理提供持久身份',
        tags: ['agent', 'identity', 'management', 'authentication'],
        category: 'automation',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/agent-id',
      },
      {
        id: 'consolidation',
        name: 'Freight Consolidation',
        description: '货运整合参考工具，LCL拼箱、集运和合并策略',
        tags: ['freight', 'consolidation', 'logistics', 'lcl'],
        category: 'analytics',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/consolidation',
      },
      {
        id: 'scrape',
        name: 'Scrape',
        description: '合法网页抓取工具，遵守robots.txt和GDPR/CCPA合规性',
        tags: ['web-scraping', 'legal', 'compliance', 'data-collection'],
        category: 'scraping',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/scrape',
      },
      {
        id: 'self-improving',
        name: 'Self-Improving Agent',
        description: '自改进代理系统，支持自我反思、学习和优化',
        tags: ['self-improving', 'ai', 'learning', 'optimization'],
        category: 'automation',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/self-improving',
      },
      {
        id: 'memory-setup-openclaw',
        name: 'Memory Setup for OpenClaw',
        description: 'OpenClaw内存配置和验证工具，用于持久上下文记忆',
        tags: ['memory', 'openclaw', 'configuration', 'setup'],
        category: 'automation',
        version: '1.0.0',
        directory: '/home/ubuntu/.openclaw/workspace/skills/memory-setup-openclaw',
      },
    ];
    
    return manifests;
  }
  
  /**
   * 读取技能目录中的技能清单
   * 
   * 注意：由于构建环境限制，此方法不再实际读取文件。
   * 生产环境中可恢复文件系统读取功能。
   */
  private async readSkillManifest(skillDir: string): Promise<SkillManifest | null> {
    // 在构建环境中返回null，实际由discoverSkills方法的硬编码列表提供
    return null;
  }
  
  /**
   * 解析SKILL.md中的frontmatter
   */
  private parseFrontmatter(content: string): Record<string, any> | null {
    // 查找frontmatter（以---开头和结尾的YAML块）
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return null;
    }
    
    const yamlContent = match[1];
    const frontmatter: Record<string, any> = {};
    
    // 简单的YAML解析（仅支持键值对）
    const lines = yamlContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        let value = trimmed.substring(colonIndex + 1).trim();
        
        // 处理引号
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        
        // 处理数组值
        if (value.startsWith('[') && value.endsWith(']')) {
          const arrayContent = value.substring(1, value.length - 1);
          frontmatter[key] = arrayContent.split(',').map((item: string) => item.trim().replace(/^["']|["']$/g, ''));
        } else {
          frontmatter[key] = value;
        }
      }
    }
    
    return frontmatter;
  }
  
  /**
   * 查找执行脚本
   * 
   * 注意：由于构建环境限制，此方法不再实际查找文件。
   * 生产环境中可恢复文件系统查找功能。
   */
  private async findExecuteScript(skillDir: string): Promise<string | undefined> {
    // 在构建环境中返回undefined，执行逻辑将回退到适配器
    return undefined;
  }
  
  /**
   * 回退清单读取（如果没有SKILL.md）
   * 
   * 注意：由于构建环境限制，此方法不再实际读取文件。
   * 生产环境中可恢复文件系统读取功能。
   */
  private async readFallbackManifest(skillDir: string): Promise<SkillManifest | null> {
    // 简单地从路径字符串提取目录名（不使用path模块）
    const dirName = skillDir.split('/').filter(Boolean).pop() || skillDir;
    
    // 在构建环境中返回基本清单
    return {
      id: dirName,
      name: dirName,
      description: `Skill: ${dirName}`,
      tags: [],
      category: 'unknown',
      version: '1.0.0',
      directory: skillDir,
    };
  }
  
  /**
   * 根据技能类别过滤技能
   */
  filterByCategory(skills: SkillManifest[], categories: string[]): SkillManifest[] {
    return skills.filter(skill => categories.includes(skill.category));
  }
  
  /**
   * 根据标签过滤技能
   */
  filterByTags(skills: SkillManifest[], tags: string[]): SkillManifest[] {
    return skills.filter(skill => 
      tags.some(tag => skill.tags.includes(tag))
    );
  }
}

/**
 * 将技能清单转换为技能能力
 * （用于与现有技能注册表集成）
 */
export function skillManifestToCapability(manifest: SkillManifest, integrationPoints: any[] = []): any {
  // 根据技能类别确定默认集成点
  const defaultPoints = getDefaultIntegrationPoints(manifest);
  
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: mapCategory(manifest.category),
    enabled: true,
    version: manifest.version,
    configPath: manifest.directory,
    integrationPoints: integrationPoints.length > 0 ? integrationPoints : defaultPoints,
    // 执行函数可以动态加载
    execute: createExecuteFunction(manifest.executeScript || '', manifest.id),
  };
}

/**
 * 根据技能类别获取默认集成点
 */
function getDefaultIntegrationPoints(manifest: SkillManifest): any[] {
  const category = manifest.category.toLowerCase();
  
  if (category.includes('contact-finding') || category.includes('data-collection')) {
    return [
      {
        id: 'contact-acquisition',
        name: 'Contact Acquisition',
        workflowStage: 'contact-acquisition',
        trigger: 'manual',
        priority: 1,
        enabled: true,
      },
    ];
  }
  
  if (category.includes('data-enrichment') || category.includes('data-processing')) {
    return [
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
    ];
  }
  
  if (category.includes('email-marketing') || category.includes('automation')) {
    return [
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
    ];
  }
  
  // 默认集成点
  return [
    {
      id: 'generic-integration',
      name: 'Generic Integration',
      workflowStage: 'contact-acquisition',
      trigger: 'manual',
      priority: 10,
      enabled: true,
    },
  ];
}

/**
 * 映射技能类别到标准类别
 */
function mapCategory(category: string): string {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('contact-finding') || lowerCategory.includes('data-collection')) {
    return 'contact-finding';
  }
  
  if (lowerCategory.includes('data-enrichment') || lowerCategory.includes('data-processing')) {
    return 'data-enrichment';
  }
  
  if (lowerCategory.includes('email-marketing') || lowerCategory.includes('automation')) {
    return 'email-marketing';
  }
  
  if (lowerCategory.includes('analytics') || lowerCategory.includes('reporting')) {
    return 'analytics';
  }
  
  return 'automation';
}

/**
 * 创建执行函数（使用适配器或动态加载脚本）
 */
function createExecuteFunction(scriptPath: string, skillId: string): (context: any, params?: Record<string, any>) => Promise<any> {
  // 首先尝试使用适配器
  try {
    const adapterFunction = createExecuteFunctionFromAdapter(skillId);
    if (adapterFunction) {
      return adapterFunction;
    }
  } catch (error) {
    console.warn(`[SkillDiscovery] Failed to create adapter for ${skillId}:`, error);
  }
  
  // 如果有脚本路径，回退到动态加载脚本
  if (scriptPath) {
    return async (context: any, params?: Record<string, any>) => {
      console.log(`[SkillExecutor] Would execute script: ${scriptPath} for skill: ${skillId}`);
      
      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        executed: true,
        skillId,
        skillScript: scriptPath,
        timestamp: new Date().toISOString(),
        mockResult: 'This is a mock execution. Implement dynamic script loading for production.',
      };
    };
  }
  
  // 既没有适配器也没有脚本路径，返回一个通用的模拟执行函数
  return async (context: any, params?: Record<string, any>) => {
    console.log(`[SkillExecutor] Mock execution for skill: ${skillId}`);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      executed: true,
      skillId,
      timestamp: new Date().toISOString(),
      mockResult: 'No adapter or script found, using generic mock execution.',
    };
  };
}

// 默认导出单例
export const skillDiscoverer = new SkillDiscoverer();