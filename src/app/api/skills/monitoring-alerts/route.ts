export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { monitoringAlertSystem } from '@/lib/monitoring-alert-system';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const acknowledged = searchParams.get('acknowledged');
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const ruleId = searchParams.get('ruleId');
    const summaryOnly = searchParams.get('summaryOnly') === 'true';
    const includeRules = searchParams.get('includeRules') !== 'false';
    
    if (ruleId) {
      // 获取特定告警规则
      const rule = monitoringAlertSystem.getAlertRule(ruleId);
      if (!rule) {
        return NextResponse.json(
          { success: false, message: `Alert rule not found: ${ruleId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        rule,
      });
    }
    
    if (summaryOnly) {
      // 获取监控摘要
      const summary = monitoringAlertSystem.getMonitoringSummary();
      
      return NextResponse.json({
        success: true,
        summary,
      });
    }
    
    // 获取告警
    const alerts = monitoringAlertSystem.getAlerts({
      acknowledged: acknowledged !== null ? acknowledged === 'true' : undefined,
      resolved: resolved !== null ? resolved === 'true' : undefined,
      severity: severity || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    
    // 获取告警规则（如果需要）
    let rules: any[] = [];
    if (includeRules) {
      rules = monitoringAlertSystem.getAlertRules();
    }
    
    return NextResponse.json({
      success: true,
      alerts,
      rules,
      totalAlerts: alerts.length,
      unacknowledgedCount: monitoringAlertSystem.getUnacknowledgedAlertCount(),
    });
  } catch (error) {
    console.error('[MonitoringAlerts API] Error:', error);
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
    
    // 支持的动作：createRule, updateRule, deleteRule, muteRule, unmuteRule, 
    // acknowledgeAlert, resolveAlert, recordMetric, recordContext
    
    if (action === 'createRule' || action === 'updateRule') {
      const rule = data.rule;
      if (!rule || !rule.id) {
        return NextResponse.json(
          { success: false, message: 'Missing or invalid rule data' },
          { status: 400 }
        );
      }
      
      monitoringAlertSystem.saveAlertRule(rule);
      
      return NextResponse.json({
        success: true,
        rule,
        message: `Alert rule ${rule.id} ${action === 'createRule' ? 'created' : 'updated'}`,
      });
    }
    
    if (action === 'deleteRule') {
      const ruleId = data.ruleId;
      if (!ruleId) {
        return NextResponse.json(
          { success: false, message: 'Missing ruleId' },
          { status: 400 }
        );
      }
      
      const success = monitoringAlertSystem.deleteAlertRule(ruleId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Failed to delete rule: ${ruleId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Alert rule ${ruleId} deleted`,
      });
    }
    
    if (action === 'muteRule') {
      const ruleId = data.ruleId;
      const muteUntil = data.muteUntil;
      
      if (!ruleId) {
        return NextResponse.json(
          { success: false, message: 'Missing ruleId' },
          { status: 400 }
        );
      }
      
      const success = monitoringAlertSystem.muteAlertRule(ruleId, muteUntil);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Rule not found: ${ruleId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Alert rule ${ruleId} muted${muteUntil ? ` until ${muteUntil}` : ''}`,
      });
    }
    
    if (action === 'unmuteRule') {
      const ruleId = data.ruleId;
      
      if (!ruleId) {
        return NextResponse.json(
          { success: false, message: 'Missing ruleId' },
          { status: 400 }
        );
      }
      
      const success = monitoringAlertSystem.unmuteAlertRule(ruleId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Rule not found: ${ruleId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Alert rule ${ruleId} unmuted`,
      });
    }
    
    if (action === 'acknowledgeAlert') {
      const alertId = data.alertId;
      const userId = data.userId;
      
      if (!alertId) {
        return NextResponse.json(
          { success: false, message: 'Missing alertId' },
          { status: 400 }
        );
      }
      
      const success = monitoringAlertSystem.acknowledgeAlert(alertId, userId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Alert not found: ${alertId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Alert ${alertId} acknowledged`,
      });
    }
    
    if (action === 'resolveAlert') {
      const alertId = data.alertId;
      const resolutionNotes = data.resolutionNotes;
      
      if (!alertId) {
        return NextResponse.json(
          { success: false, message: 'Missing alertId' },
          { status: 400 }
        );
      }
      
      const success = monitoringAlertSystem.resolveAlert(alertId, resolutionNotes);
      if (!success) {
        return NextResponse.json(
          { success: false, message: `Alert not found: ${alertId}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Alert ${alertId} resolved`,
      });
    }
    
    if (action === 'recordMetric') {
      const metric = data.metric;
      
      if (!metric || !metric.metricType || metric.value === undefined) {
        return NextResponse.json(
          { success: false, message: 'Missing or invalid metric data' },
          { status: 400 }
        );
      }
      
      monitoringAlertSystem.recordMetric(metric);
      
      return NextResponse.json({
        success: true,
        message: 'Metric recorded',
      });
    }
    
    if (action === 'recordContext') {
      const context = data.context;
      
      if (!context || !context.contextId || !context.contextType) {
        return NextResponse.json(
          { success: false, message: 'Missing or invalid context data' },
          { status: 400 }
        );
      }
      
      monitoringAlertSystem.recordContext(context);
      
      return NextResponse.json({
        success: true,
        message: 'Context recorded',
      });
    }
    
    if (action === 'cleanup') {
      const maxAgeDays = data.maxAgeDays || 30;
      
      monitoringAlertSystem.cleanupOldData(maxAgeDays);
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up data older than ${maxAgeDays} days`,
      });
    }
    
    // 默认动作：记录监控上下文
    if (data.context) {
      monitoringAlertSystem.recordContext(data.context);
      
      return NextResponse.json({
        success: true,
        message: 'Context recorded (default action)',
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Invalid action. Supported actions: createRule, updateRule, deleteRule, muteRule, unmuteRule, acknowledgeAlert, resolveAlert, recordMetric, recordContext, cleanup' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[MonitoringAlerts API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}