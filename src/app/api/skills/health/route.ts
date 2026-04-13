import { NextResponse } from 'next/server';
import { skillsRegistry } from '@/lib/skills-registry';
import { skillsConfig, validateSkillsConfig } from '@/lib/skills-config';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // 检查配置
    const configErrors = validateSkillsConfig(skillsConfig);
    
    // 检查技能注册表
    const allSkills = skillsRegistry.getAllSkills();
    const enabledSkills = allSkills.filter(skill => skill.enabled);
    
    // 检查技能目录（如果配置了自动发现）
    let skillsDirectoryAccessible = false;
    if (skillsConfig.skills.autoDiscover) {
      try {
        // 简单检查目录是否存在（通过尝试列出技能）
        if (allSkills.length > 0) {
          skillsDirectoryAccessible = true;
        }
      } catch (error) {
        console.warn('[Skills Health] Skills directory not accessible:', error);
      }
    }
    
    // 检查依赖服务（如果有）
    const dependencies = {
      skillsRegistry: true, // 总是可用
      skillsDirectory: skillsDirectoryAccessible,
    };
    
    // 确定整体状态
    const hasCriticalErrors = configErrors.length > 0 && configErrors.some(error => 
      error.includes('required') || error.includes('SKILLS_DIRECTORY')
    );
    
    const status = hasCriticalErrors ? 'degraded' : 'ok';
    
    const response = {
      status,
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      config: {
        skillsCount: allSkills.length,
        enabledSkillsCount: enabledSkills.length,
        autoDiscover: skillsConfig.skills.autoDiscover,
        skillsDirectory: skillsConfig.skills.skillsDirectory,
      },
      checks: {
        config: {
          passed: configErrors.length === 0,
          errors: configErrors,
        },
        skillsRegistry: {
          passed: true,
          skills: allSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            enabled: skill.enabled,
            category: skill.category,
          })),
        },
        skillsDirectory: {
          passed: skillsDirectoryAccessible || !skillsConfig.skills.autoDiscover,
          accessible: skillsDirectoryAccessible,
        },
      },
      dependencies,
      version: '1.0.0',
      service: 'FYMail Skills System',
    };
    
    return NextResponse.json(response, {
      status: status === 'degraded' ? 503 : 200,
    });
  } catch (error) {
    console.error('[Skills Health] Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'FYMail Skills System',
    }, {
      status: 500,
    });
  }
}