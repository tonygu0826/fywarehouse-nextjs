export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { bulkSendStrategyManager } from '@/lib/bulk-send-strategy';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const includePresets = searchParams.get('includePresets') !== 'false';
    
    let strategies = bulkSendStrategyManager.getAllStrategies();
    
    // 过滤预设（如果需要）
    if (!includePresets) {
      // 注意：这里简化处理，实际可能需要标记是否为预设
      strategies = strategies.filter(s => !['conservative', 'balanced', 'aggressive', 'european-freight'].includes(s.id));
    }
    
    // 获取活动策略
    const activeStrategy = bulkSendStrategyManager.getActiveStrategy();
    
    return NextResponse.json({
      strategies,
      activeStrategy,
      count: strategies.length,
    });
  } catch (error) {
    console.error('[Strategies API] Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, strategy, strategyId, newId, newName, contacts, goals } = body;
    
    // 支持的动作：create, update, delete, clone, setActive, optimize, recommend
    if (action === 'setActive' && strategyId) {
      const success = bulkSendStrategyManager.setActiveStrategy(strategyId);
      if (!success) {
        return NextResponse.json(
          { message: `Strategy not found: ${strategyId}` },
          { status: 404 }
        );
      }
      
      const activeStrategy = bulkSendStrategyManager.getActiveStrategy();
      return NextResponse.json({ 
        success: true, 
        activeStrategy,
        message: `Strategy ${strategyId} set as active`,
      });
    }
    
    if (action === 'clone' && strategyId && newId && newName) {
      const cloned = bulkSendStrategyManager.cloneStrategy(strategyId, newId, newName);
      if (!cloned) {
        return NextResponse.json(
          { message: `Source strategy not found: ${strategyId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        strategy: cloned,
        message: `Strategy cloned as ${newName}`,
      });
    }
    
    if (action === 'delete' && strategyId) {
      const success = bulkSendStrategyManager.deleteStrategy(strategyId);
      if (!success) {
        return NextResponse.json(
          { message: `Cannot delete strategy: ${strategyId} (may be a preset)` },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Strategy ${strategyId} deleted`,
      });
    }
    
    if (action === 'optimize' && strategyId && contacts) {
      const strategy = bulkSendStrategyManager.getStrategy(strategyId);
      if (!strategy) {
        return NextResponse.json(
          { message: `Strategy not found: ${strategyId}` },
          { status: 404 }
        );
      }
      
      const optimized = bulkSendStrategyManager.optimizeStrategyForContacts(strategy, contacts);
      return NextResponse.json({
        success: true,
        original: strategy,
        optimized,
        changes: compareStrategies(strategy, optimized),
      });
    }
    
    if (action === 'recommend' && contacts) {
      const recommendations = bulkSendStrategyManager.generateStrategyRecommendations(contacts, goals || []);
      return NextResponse.json({
        success: true,
        recommendations,
        contactCount: contacts.length,
      });
    }
    
    if (action === 'apply' && strategyId) {
      // 应用策略到任务的逻辑在客户端处理，这里返回策略详情
      const strategy = bulkSendStrategyManager.getStrategy(strategyId);
      if (!strategy) {
        return NextResponse.json(
          { message: `Strategy not found: ${strategyId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        strategy,
        applicationTemplate: bulkSendStrategyManager.applyStrategyToJob({}, strategyId),
      });
    }
    
    // 默认：创建或更新策略
    if (strategy && strategy.id) {
      bulkSendStrategyManager.saveStrategy(strategy);
      return NextResponse.json({ 
        success: true, 
        strategy,
        message: `Strategy ${strategy.id} saved`,
      });
    }
    
    return NextResponse.json(
      { message: 'Invalid request. Provide action or strategy data.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Strategies API] Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// 辅助函数：比较策略差异
function compareStrategies(original: any, optimized: any): string[] {
  const changes: string[] = [];
  
  if (original.batching.batchSize !== optimized.batching.batchSize) {
    changes.push(`Batch size changed from ${original.batching.batchSize} to ${optimized.batching.batchSize}`);
  }
  
  if (original.filtering.minDataQuality !== optimized.filtering.minDataQuality) {
    changes.push(`Minimum data quality changed from ${original.filtering.minDataQuality} to ${optimized.filtering.minDataQuality}`);
  }
  
  if (original.batching.adaptiveBatching !== optimized.batching.adaptiveBatching) {
    changes.push(`Adaptive batching ${optimized.batching.adaptiveBatching ? 'enabled' : 'disabled'}`);
  }
  
  return changes;
}