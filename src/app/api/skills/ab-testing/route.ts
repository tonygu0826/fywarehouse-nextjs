export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { abTestingFramework } from '@/lib/ab-testing-framework';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const testId = searchParams.get('testId');
    const status = searchParams.get('status') as any;
    const enabled = searchParams.get('enabled');
    const includeResults = searchParams.get('includeResults') === 'true';
    const eventType = searchParams.get('eventType') as any;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    
    if (testId) {
      // 获取特定测试
      const test = abTestingFramework.getTest(testId);
      if (!test) {
        return NextResponse.json(
          { success: false, message: `Test not found: ${testId}` },
          { status: 404 }
        );
      }
      
      // 获取测试结果（如果需要）
      let results: any = null;
      if (includeResults && (test.status === 'active' || test.status === 'completed')) {
        results = abTestingFramework.getTestResults(testId);
      }
      
      // 获取测试事件
      const events = abTestingFramework.getTestEvents(testId, {
        eventType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
      
      return NextResponse.json({
        success: true,
        test,
        results,
        events: {
          count: events.length,
          samples: events.slice(0, 10), // 返回前10个事件作为示例
        },
      });
    }
    
    // 获取所有测试
    const tests = abTestingFramework.getAllTests({
      status,
      enabled: enabled !== null ? enabled === 'true' : undefined,
    });
    
    return NextResponse.json({
      success: true,
      tests,
      count: tests.length,
      summary: {
        draft: tests.filter(t => t.status === 'draft').length,
        active: tests.filter(t => t.status === 'active').length,
        paused: tests.filter(t => t.status === 'paused').length,
        completed: tests.filter(t => t.status === 'completed').length,
        archived: tests.filter(t => t.status === 'archived').length,
      },
    });
  } catch (error) {
    console.error('[ABTesting API] Error:', error);
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
    const { action, ...data } = body;
    
    // 支持的动作：createTest, updateTest, startTest, pauseTest, completeTest,
    // assignVariant, recordExposure, recordConversion, getResults, cleanup
    
    if (action === 'createTest') {
      const testConfig = data.testConfig;
      
      if (!testConfig || !testConfig.name) {
        return NextResponse.json(
          { success: false, message: 'Missing or invalid test configuration' },
          { status: 400 }
        );
      }
      
      const test = abTestingFramework.createTest(testConfig);
      
      return NextResponse.json({
        success: true,
        test,
        message: `Test "${test.name}" created with ID: ${test.testId}`,
      });
    }
    
    if (action === 'updateTest') {
      const testId = data.testId;
      const updates = data.updates;
      
      if (!testId || !updates) {
        return NextResponse.json(
          { success: false, message: 'Missing testId or updates' },
          { status: 400 }
        );
      }
      
      const success = abTestingFramework.updateTest(testId, updates);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Test not found: ${testId}` },
          { status: 404 }
        );
      }
      
      const test = abTestingFramework.getTest(testId);
      
      return NextResponse.json({
        success: true,
        test,
        message: `Test ${testId} updated`,
      });
    }
    
    if (action === 'startTest') {
      const testId = data.testId;
      
      if (!testId) {
        return NextResponse.json(
          { success: false, message: 'Missing testId' },
          { status: 400 }
        );
      }
      
      const success = abTestingFramework.startTest(testId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Cannot start test ${testId} (may not be in draft or paused state)` },
          { status: 400 }
        );
      }
      
      const test = abTestingFramework.getTest(testId);
      
      return NextResponse.json({
        success: true,
        test,
        message: `Test "${test?.name}" started`,
      });
    }
    
    if (action === 'pauseTest') {
      const testId = data.testId;
      
      if (!testId) {
        return NextResponse.json(
          { success: false, message: 'Missing testId' },
          { status: 400 }
        );
      }
      
      const success = abTestingFramework.pauseTest(testId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Cannot pause test ${testId} (may not be active)` },
          { status: 400 }
        );
      }
      
      const test = abTestingFramework.getTest(testId);
      
      return NextResponse.json({
        success: true,
        test,
        message: `Test "${test?.name}" paused`,
      });
    }
    
    if (action === 'completeTest') {
      const testId = data.testId;
      
      if (!testId) {
        return NextResponse.json(
          { success: false, message: 'Missing testId' },
          { status: 400 }
        );
      }
      
      const success = abTestingFramework.completeTest(testId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Cannot complete test ${testId}` },
          { status: 400 }
        );
      }
      
      const test = abTestingFramework.getTest(testId);
      
      return NextResponse.json({
        success: true,
        test,
        message: `Test "${test?.name}" completed`,
      });
    }
    
    if (action === 'assignVariant') {
      const testId = data.testId;
      const resourceId = data.resourceId;
      const resourceType = data.resourceType;
      
      if (!testId || !resourceId || !resourceType) {
        return NextResponse.json(
          { success: false, message: 'Missing testId, resourceId, or resourceType' },
          { status: 400 }
        );
      }
      
      const assignment = abTestingFramework.assignVariant(testId, resourceId, resourceType);
      if (!assignment) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Cannot assign variant for test ${testId}. Test may not be active or sampling rate excluded this assignment.` 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        success: true,
        assignment,
        message: `Variant assigned for resource ${resourceId}`,
      });
    }
    
    if (action === 'recordExposure') {
      const testId = data.testId;
      const resourceId = data.resourceId;
      const resourceType = data.resourceType;
      
      if (!testId || !resourceId || !resourceType) {
        return NextResponse.json(
          { success: false, message: 'Missing testId, resourceId, or resourceType' },
          { status: 400 }
        );
      }
      
      const success = abTestingFramework.recordExposure(testId, resourceId, resourceType);
      if (!success) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Cannot record exposure for test ${testId}. Resource may not be assigned or already exposed.` 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Exposure recorded for resource ${resourceId}`,
      });
    }
    
    if (action === 'recordConversion') {
      const testId = data.testId;
      const resourceId = data.resourceId;
      const resourceType = data.resourceType;
      const conversionValue = data.conversionValue;
      
      if (!testId || !resourceId || !resourceType) {
        return NextResponse.json(
          { success: false, message: 'Missing testId, resourceId, or resourceType' },
          { status: 400 }
        );
      }
      
      const success = abTestingFramework.recordConversion(
        testId, 
        resourceId, 
        resourceType,
        conversionValue
      );
      
      if (!success) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Cannot record conversion for test ${testId}. Resource may not be exposed or already converted.` 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Conversion recorded for resource ${resourceId}`,
      });
    }
    
    if (action === 'getResults') {
      const testId = data.testId;
      
      if (!testId) {
        return NextResponse.json(
          { success: false, message: 'Missing testId' },
          { status: 400 }
        );
      }
      
      const results = abTestingFramework.getTestResults(testId);
      if (!results) {
        return NextResponse.json(
          { success: false, message: `Test not found: ${testId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        results,
      });
    }
    
    if (action === 'cleanup') {
      const maxAgeDays = data.maxAgeDays || 180;
      
      abTestingFramework.cleanupOldData(maxAgeDays);
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up data older than ${maxAgeDays} days`,
      });
    }
    
    // 默认动作：创建测试
    if (data.testConfig) {
      const test = abTestingFramework.createTest(data.testConfig);
      
      return NextResponse.json({
        success: true,
        test,
        message: `Test "${test.name}" created with ID: ${test.testId}`,
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Invalid action. Supported actions: createTest, updateTest, startTest, pauseTest, completeTest, assignVariant, recordExposure, recordConversion, getResults, cleanup' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[ABTesting API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}