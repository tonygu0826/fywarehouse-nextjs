export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { strategyRecommendationEngine } from '@/lib/strategy-recommendation-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const strategyId = searchParams.get('strategyId');
    
    if (strategyId) {
      // 获取特定策略的历史性能
      const historicalPerformance = strategyRecommendationEngine.getHistoricalPerformance(strategyId);
      
      return NextResponse.json({
        success: true,
        historicalPerformance,
      });
    }
    
    // 否则返回所有可用指标类型
    const metricTypes = ['failureRate', 'executionTime', 'successRate', 'errorCount', 'cacheHitRate', 'throughput', 'openRate', 'replyRate', 'conversionRate'];
    
    return NextResponse.json({
      success: true,
      metricTypes,
      endpoints: {
        POST: '/api/skills/strategy-recommendations - 生成策略推荐',
        GET: '/api/skills/strategy-recommendations?strategyId=<id> - 获取策略历史性能',
      },
      note: '使用POST方法生成策略推荐',
    });
  } catch (error) {
    console.error('[StrategyRecommendations API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contacts, taskCharacteristics, generateOnlyTop = 3 } = body;
    
    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing or invalid contacts array' 
        },
        { status: 400 }
      );
    }
    
    // 默认任务特征
    const defaultTaskCharacteristics = {
      goals: ['engagement', 'conversion'],
      priority: 'medium' as const,
      riskTolerance: 'balanced' as const,
      personalizationRequirement: 'advanced' as const,
    };
    
    const taskChars = {
      ...defaultTaskCharacteristics,
      ...taskCharacteristics,
    };
    
    // 生成推荐
    const recommendations = await strategyRecommendationEngine.generateRecommendations(
      contacts,
      taskChars
    );
    
    // 如果只需要顶部推荐
    let finalRecommendations: any[] = recommendations;
    if (generateOnlyTop && recommendations.length > generateOnlyTop) {
      finalRecommendations = recommendations.slice(0, generateOnlyTop);
    }
    
    // 分析联系人特征（用于响应）
    const contactCharacteristics = {
      count: contacts.length,
      note: 'Contact characteristics analysis not available',
    };
    
    return NextResponse.json({
      success: true,
      recommendations: finalRecommendations,
      contactCount: contacts.length,
      contactCharacteristics,
      generatedAt: new Date().toISOString(),
      note: 'Recommendations are generated based on contact characteristics and task goals. Confidence scores indicate prediction reliability.',
    });
  } catch (error) {
    console.error('[StrategyRecommendations API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}