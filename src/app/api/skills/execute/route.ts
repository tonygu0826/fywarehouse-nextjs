export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { skillsRegistry, skillExecutor, discoverAndLoadSkills } from '@/lib/skills-registry';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, skillId, workflowStage, context, params, enabled } = body;
    
    // 支持动作：discover, toggle, execute
    if (action === 'discover') {
      // 发现并加载新技能
      await skillsRegistry.reloadSkills();
      const skills = skillsRegistry.getAllSkills();
      return NextResponse.json({ 
        message: `Discovered and reloaded ${skills.length} skills`, 
        skills: skills.slice(0, 10) // 限制返回数量
      });
    }
    
    if (action === 'toggle' && skillId !== undefined) {
      // 启用/禁用技能
      const success = skillsRegistry.setSkillEnabled(skillId, enabled !== false);
      if (!success) {
        return NextResponse.json(
          { message: `Skill not found: ${skillId}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        success: true, 
        skillId, 
        enabled: enabled !== false 
      });
    }
    
    // 原有执行逻辑
    if (!skillId && !workflowStage) {
      return NextResponse.json(
        { message: 'Either skillId or workflowStage is required.' },
        { status: 400 }
      );
    }
    
    if (skillId) {
      // 执行特定技能
      const skill = skillsRegistry.getSkill(skillId);
      if (!skill) {
        return NextResponse.json(
          { message: `Skill not found: ${skillId}` },
          { status: 404 }
        );
      }
      
      if (!skill.enabled) {
        return NextResponse.json(
          { message: `Skill is disabled: ${skillId}` },
          { status: 400 }
        );
      }
      
      const result = await skillExecutor.executeSkill(skillId, context || {}, params);
      return NextResponse.json({ result });
    } else {
      // 执行工作流阶段的所有技能
      const results = await skillExecutor.executeForWorkflowStage(workflowStage, context || {}, params);
      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error('[Skills API] Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 确保使用最新发现的技能
  await skillsRegistry.reloadSkills();
  
  // 返回已注册的技能列表
  const skills = skillsRegistry.getAllSkills().map(skill => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    enabled: skill.enabled,
    version: skill.version,
    integrationPoints: skill.integrationPoints,
  }));
  
  return NextResponse.json({ skills });
}