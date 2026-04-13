export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { contactEnrichmentPipeline } from '@/lib/contact-enrichment-pipeline';

export async function GET(request: Request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const includeCacheDetails = searchParams.get('includeCacheDetails') === 'true';
    const resetCache = searchParams.get('resetCache') === 'true';
    
    // 如果需要重置缓存
    if (resetCache) {
      contactEnrichmentPipeline.clearCache();
    }
    
    // 获取监控指标
    const metrics = contactEnrichmentPipeline.getMonitoringMetrics();
    
    // 获取步骤详情
    const steps = contactEnrichmentPipeline.getSteps().map(step => ({
      name: step.name,
      description: step.description,
      workflowStage: step.workflowStage,
      enabled: step.enabled,
    }));
    
    // 获取缓存详情（如果需要）
    let cacheDetails: any = undefined;
    if (includeCacheDetails) {
      // 注意：实际缓存实现可能不暴露内部细节，这里返回摘要
      cacheDetails = {
        size: metrics.cacheSize,
        note: 'Cache details are internal to the pipeline',
      };
    }
    
    return NextResponse.json({
      success: true,
      metrics,
      steps,
      cacheDetails,
      pipeline: 'EnhancedContactEnrichmentPipeline',
    });
  } catch (error) {
    console.error('[EnrichmentMonitoring API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}