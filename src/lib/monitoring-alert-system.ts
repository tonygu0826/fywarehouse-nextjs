/**
 * Monitoring Alert System for FYMail
 * 
 * 监控告警机制：失败率/耗时等阈值提醒基础能力。
 * 提供可配置的阈值监控、告警触发和通知功能。
 * 
 * 硬约束：不修改登录代码、登录流程、鉴权逻辑。
 */

import { sendEmail } from './email-service-client';

export interface AlertRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 监控指标类型 */
  metricType: 'failureRate' | 'executionTime' | 'successRate' | 'errorCount' | 'cacheHitRate' | 'throughput';
  /** 阈值比较操作符 */
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  /** 阈值 */
  threshold: number;
  /** 时间窗口（分钟） */
  timeWindowMinutes: number;
  /** 评估间隔（分钟） */
  evaluationIntervalMinutes: number;
  /** 告警级别 */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** 是否启用 */
  enabled: boolean;
  /** 是否静默 */
  muted: boolean;
  /** 静默过期时间 */
  mutedUntil?: string;
  /** 触发后冷却时间（分钟） */
  cooldownMinutes: number;
  /** 最后触发时间 */
  lastTriggeredAt?: string;
  /** 触发次数 */
  triggerCount: number;
  /** 通知渠道 */
  notificationChannels: ('log' | 'email' | 'webhook' | 'slack' | 'dashboard')[];
  /** 通知模板 */
  notificationTemplate?: string;
}

export interface Alert {
  /** 告警ID */
  id: string;
  /** 规则ID */
  ruleId: string;
  /** 告警标题 */
  title: string;
  /** 告警详情 */
  details: Record<string, any>;
  /** 告警级别 */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** 触发时间 */
  triggeredAt: string;
  /** 是否已确认 */
  acknowledged: boolean;
  /** 确认时间 */
  acknowledgedAt?: string;
  /** 确认用户 */
  acknowledgedBy?: string;
  /** 是否已解决 */
  resolved: boolean;
  /** 解决时间 */
  resolvedAt?: string;
  /** 解决说明 */
  resolutionNotes?: string;
  /** 相关资源ID */
  resourceId?: string;
  /** 相关资源类型 */
  resourceType?: string;
}

export interface MetricDataPoint {
  /** 指标类型 */
  metricType: string;
  /** 指标值 */
  value: number;
  /** 时间戳 */
  timestamp: string;
  /** 标签 */
  tags: Record<string, string>;
  /** 资源ID */
  resourceId?: string;
  /** 资源类型 */
  resourceType?: string;
}

export interface MonitoringContext {
  /** 上下文ID */
  contextId: string;
  /** 上下文类型 */
  contextType: 'skill-execution' | 'enrichment-pipeline' | 'bulk-send-job' | 'api-endpoint';
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime?: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 持续时间（毫秒） */
  durationMs: number;
  /** 附加数据 */
  metadata?: Record<string, any>;
}

/**
 * 监控告警系统
 */
export class MonitoringAlertSystem {
  private alertRules: Map<string, AlertRule> = new Map();
  private alerts: Alert[] = [];
  private metricStore: MetricDataPoint[] = [];
  private maxAlerts: number = 1000;
  private maxMetrics: number = 10000;
  
  constructor() {
    this.initializeDefaultRules();
  }
  
  /**
   * 初始化默认告警规则
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high-failure-rate',
        name: '高失败率告警',
        description: '技能执行失败率超过阈值',
        metricType: 'failureRate',
        operator: 'gt',
        threshold: 0.3, // 30%
        timeWindowMinutes: 60,
        evaluationIntervalMinutes: 5,
        severity: 'error',
        enabled: true,
        muted: false,
        cooldownMinutes: 30,
        triggerCount: 0,
        notificationChannels: ['log', 'dashboard'],
      },
      {
        id: 'slow-execution',
        name: '慢执行告警',
        description: '技能执行时间超过阈值',
        metricType: 'executionTime',
        operator: 'gt',
        threshold: 5000, // 5秒
        timeWindowMinutes: 30,
        evaluationIntervalMinutes: 5,
        severity: 'warning',
        enabled: true,
        muted: false,
        cooldownMinutes: 15,
        triggerCount: 0,
        notificationChannels: ['log', 'dashboard'],
      },
      {
        id: 'low-success-rate',
        name: '低成功率告警',
        description: '技能执行成功率低于阈值',
        metricType: 'successRate',
        operator: 'lt',
        threshold: 0.7, // 70%
        timeWindowMinutes: 120,
        evaluationIntervalMinutes: 10,
        severity: 'warning',
        enabled: true,
        muted: false,
        cooldownMinutes: 60,
        triggerCount: 0,
        notificationChannels: ['log', 'dashboard'],
      },
      {
        id: 'high-error-count',
        name: '高错误计数告警',
        description: '短时间内错误数量超过阈值',
        metricType: 'errorCount',
        operator: 'gt',
        threshold: 10,
        timeWindowMinutes: 10,
        evaluationIntervalMinutes: 2,
        severity: 'critical',
        enabled: true,
        muted: false,
        cooldownMinutes: 5,
        triggerCount: 0,
        notificationChannels: ['log', 'dashboard'],
      },
      {
        id: 'low-cache-hit-rate',
        name: '低缓存命中率告警',
        description: '缓存命中率低于阈值',
        metricType: 'cacheHitRate',
        operator: 'lt',
        threshold: 0.5, // 50%
        timeWindowMinutes: 60,
        evaluationIntervalMinutes: 15,
        severity: 'info',
        enabled: true,
        muted: false,
        cooldownMinutes: 30,
        triggerCount: 0,
        notificationChannels: ['log', 'dashboard'],
      },
    ];
    
    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }
  
  /**
   * 记录监控指标
   */
  recordMetric(metric: Omit<MetricDataPoint, 'timestamp'>): void {
    const metricWithTimestamp: MetricDataPoint = {
      ...metric,
      timestamp: new Date().toISOString(),
    };
    
    this.metricStore.unshift(metricWithTimestamp);
    
    // 限制指标存储数量
    if (this.metricStore.length > this.maxMetrics) {
      this.metricStore = this.metricStore.slice(0, this.maxMetrics);
    }
    
    // 触发相关告警规则评估
    this.evaluateRulesForMetric(metricWithTimestamp);
  }
  
  /**
   * 记录监控上下文（执行结果）
   */
  recordContext(context: MonitoringContext): void {
    // 记录成功率指标
    this.recordMetric({
      metricType: 'successRate',
      value: context.success ? 1 : 0,
      tags: {
        contextType: context.contextType,
        contextId: context.contextId,
      },
      resourceId: context.metadata?.resourceId,
      resourceType: context.metadata?.resourceType,
    });
    
    // 记录执行时间指标
    this.recordMetric({
      metricType: 'executionTime',
      value: context.durationMs,
      tags: {
        contextType: context.contextType,
        contextId: context.contextId,
        success: context.success.toString(),
      },
      resourceId: context.metadata?.resourceId,
      resourceType: context.metadata?.resourceType,
    });
    
    // 记录错误计数指标（如果失败）
    if (!context.success) {
      this.recordMetric({
        metricType: 'errorCount',
        value: 1,
        tags: {
          contextType: context.contextType,
          contextId: context.contextId,
          errorType: context.error?.split(':')[0] || 'unknown',
        },
        resourceId: context.metadata?.resourceId,
        resourceType: context.metadata?.resourceType,
      });
    }
    
    // 评估所有告警规则
    this.evaluateAllRules();
  }
  
  /**
   * 评估所有告警规则
   */
  private evaluateAllRules(): void {
    const now = new Date();
    
    for (const rule of this.alertRules.values()) {
      // 跳过未启用的规则
      if (!rule.enabled) continue;
      
      // 检查冷却时间
      if (rule.lastTriggeredAt) {
        const lastTriggered = new Date(rule.lastTriggeredAt);
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        if (now.getTime() - lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }
      
      // 检查静默
      if (rule.muted && rule.mutedUntil) {
        const mutedUntil = new Date(rule.mutedUntil);
        if (now < mutedUntil) {
          continue;
        } else {
          // 静默过期
          rule.muted = false;
          rule.mutedUntil = undefined;
        }
      }
      
      // 评估规则
      const shouldTrigger = this.evaluateRule(rule);
      
      if (shouldTrigger) {
        this.triggerAlert(rule);
      }
    }
  }
  
  /**
   * 为单个指标评估相关规则
   */
  private evaluateRulesForMetric(metric: MetricDataPoint): void {
    const now = new Date();
    
    for (const rule of this.alertRules.values()) {
      // 跳过不相关的规则
      if (rule.metricType !== metric.metricType) continue;
      if (!rule.enabled) continue;
      
      // 检查冷却时间
      if (rule.lastTriggeredAt) {
        const lastTriggered = new Date(rule.lastTriggeredAt);
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        if (now.getTime() - lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }
      
      // 检查静默
      if (rule.muted && rule.mutedUntil) {
        const mutedUntil = new Date(rule.mutedUntil);
        if (now < mutedUntil) {
          continue;
        }
      }
      
      // 评估规则
      const shouldTrigger = this.evaluateRule(rule);
      
      if (shouldTrigger) {
        this.triggerAlert(rule, metric);
      }
    }
  }
  
  /**
   * 评估单个告警规则
   */
  private evaluateRule(rule: AlertRule, specificMetric?: MetricDataPoint): boolean {
    const now = new Date();
    const timeWindowStart = new Date(now.getTime() - rule.timeWindowMinutes * 60 * 1000);
    
    // 获取时间窗口内的相关指标
    let relevantMetrics: MetricDataPoint[];
    
    if (specificMetric) {
      // 如果提供了特定指标，只使用该指标
      relevantMetrics = [specificMetric];
    } else {
      relevantMetrics = this.metricStore.filter(metric => {
        const metricTime = new Date(metric.timestamp);
        return (
          metric.metricType === rule.metricType &&
          metricTime >= timeWindowStart &&
          metricTime <= now
        );
      });
    }
    
    if (relevantMetrics.length === 0) {
      return false;
    }
    
    // 根据指标类型计算聚合值
    const aggregatedValue = this.calculateAggregatedValue(rule.metricType, relevantMetrics);
    
    // 应用阈值比较
    return this.compareWithThreshold(aggregatedValue, rule.operator, rule.threshold);
  }
  
  /**
   * 计算聚合值
   */
  private calculateAggregatedValue(metricType: string, metrics: MetricDataPoint[]): number {
    switch (metricType) {
      case 'failureRate':
        // 失败率 = 失败次数 / 总次数
        const total = metrics.length;
        const failures = metrics.filter(m => m.value === 0).length;
        return failures / total;
        
      case 'successRate':
        // 成功率 = 成功次数 / 总次数
        const total2 = metrics.length;
        const successes = metrics.filter(m => m.value === 1).length;
        return successes / total2;
        
      case 'executionTime':
        // 执行时间平均值
        const values = metrics.map(m => m.value);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
        
      case 'errorCount':
        // 错误计数总和
        return metrics.reduce((sum, metric) => sum + metric.value, 0);
        
      case 'cacheHitRate':
        // 缓存命中率平均值
        const cacheValues = metrics.map(m => m.value);
        return cacheValues.reduce((sum, val) => sum + val, 0) / cacheValues.length;
        
      case 'throughput':
        // 吞吐量总和
        return metrics.reduce((sum, metric) => sum + metric.value, 0);
        
      default:
        // 默认取平均值
        const defaultValues = metrics.map(m => m.value);
        return defaultValues.reduce((sum, val) => sum + val, 0) / defaultValues.length;
    }
  }
  
  /**
   * 比较值与阈值
   */
  private compareWithThreshold(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      case 'eq': return Math.abs(value - threshold) < 0.0001;
      case 'neq': return Math.abs(value - threshold) >= 0.0001;
      default: return false;
    }
  }
  
  /**
   * 触发告警
   */
  private triggerAlert(rule: AlertRule, metric?: MetricDataPoint): void {
    const alertId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // 更新规则状态
    rule.lastTriggeredAt = now;
    rule.triggerCount += 1;
    this.alertRules.set(rule.id, rule);
    
    // 创建告警
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      title: rule.name,
      details: {
        metricType: rule.metricType,
        threshold: rule.threshold,
        operator: rule.operator,
        actualValue: metric?.value,
        timeWindowMinutes: rule.timeWindowMinutes,
      },
      severity: rule.severity,
      triggeredAt: now,
      acknowledged: false,
      resolved: false,
    };
    
    this.alerts.unshift(alert);
    
    // 限制告警数量
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }
    
    // 发送通知
    this.sendNotifications(alert, rule, metric);
    
    console.log(`[MonitoringAlertSystem] Alert triggered: ${rule.name} (${rule.severity})`);
  }
  
  /**
   * 发送通知
   */
  private sendNotifications(alert: Alert, rule: AlertRule, metric?: MetricDataPoint): void {
    const notificationChannels = rule.notificationChannels || ['log'];
    
    notificationChannels.forEach(channel => {
      switch (channel) {
        case 'log':
          this.sendLogNotification(alert, rule, metric);
          break;
        case 'dashboard':
          // 前端仪表板会轮询告警API
          break;
        case 'email':
          // 异步发送邮件，不等待完成
          this.sendEmailNotification(alert, rule, metric).catch(error => {
            console.error(`[MonitoringAlertSystem] Error in email notification for alert ${alert.id}:`, error);
          });
          break;
        case 'slack':
          // 需要Slack集成
          console.log(`[MonitoringAlertSystem] Slack notification would be sent for alert: ${alert.id}`);
          break;
        case 'webhook':
          // 需要webhook配置
          console.log(`[MonitoringAlertSystem] Webhook notification would be sent for alert: ${alert.id}`);
          break;
      }
    });
  }
  
  /**
   * 发送日志通知
   */
  private sendLogNotification(alert: Alert, rule: AlertRule, metric?: MetricDataPoint): void {
    const logLevel = rule.severity === 'critical' || rule.severity === 'error' ? 'error' :
                     rule.severity === 'warning' ? 'warn' : 'info';
    
    const message = `[${rule.severity.toUpperCase()}] ${rule.name}: ${rule.description}`;
    const details = {
      alertId: alert.id,
      ruleId: rule.id,
      metricType: rule.metricType,
      threshold: rule.threshold,
      actualValue: metric?.value,
      triggeredAt: alert.triggeredAt,
    };
    
    if (logLevel === 'error') {
      console.error(message, details);
    } else if (logLevel === 'warn') {
      console.warn(message, details);
    } else {
      console.info(message, details);
    }
  }
  
  /**
   * 发送邮件通知
   */
  private async sendEmailNotification(alert: Alert, rule: AlertRule, metric?: MetricDataPoint): Promise<void> {
    try {
      // 获取收件人地址 - 从环境变量或使用默认值
      const recipientEmail = process.env.ALERT_EMAIL_RECIPIENT || process.env.FYMAIL_ADMIN_EMAIL || 'admin@example.com';
      
      if (!recipientEmail || recipientEmail === 'admin@example.com') {
        console.warn('[MonitoringAlertSystem] No valid alert email recipient configured. Set ALERT_EMAIL_RECIPIENT or FYMAIL_ADMIN_EMAIL environment variable.');
        return;
      }
      
      // 构建邮件内容
      const severityEmoji = {
        critical: '🔴',
        error: '🟠',
        warning: '🟡',
        info: '🔵'
      }[rule.severity] || '⚪';
      
      const subject = `${severityEmoji} [FYMail Alert] ${rule.name} - ${rule.severity.toUpperCase()}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #${rule.severity === 'critical' ? 'd32f2f' : rule.severity === 'error' ? 'f57c00' : rule.severity === 'warning' ? 'fbc02d' : '1976d2'}">
            ${severityEmoji} FYMail 系统告警
          </h2>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <h3 style="margin-top: 0;">${rule.name}</h3>
            <p>${rule.description}</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>告警级别</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rule.severity.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>监控指标</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rule.metricType}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>阈值</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rule.operator} ${rule.threshold}</td>
              </tr>
              ${metric ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>实际值</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${metric.value.toFixed(4)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>触发时间</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(alert.triggeredAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>告警ID</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.id}</td>
              </tr>
            </table>
          </div>
          <div style="font-size: 12px; color: #666; margin-top: 24px;">
            <p>此邮件由 FYMail 监控告警系统自动发送。</p>
            <p>如需修改告警设置，请访问 FYMail 管理界面。</p>
          </div>
        </div>
      `;
      
      const text = `
FYMail 系统告警
===============

告警名称: ${rule.name}
告警描述: ${rule.description}
告警级别: ${rule.severity.toUpperCase()}
监控指标: ${rule.metricType}
阈值条件: ${rule.operator} ${rule.threshold}
${metric ? `实际值: ${metric.value.toFixed(4)}` : ''}
触发时间: ${new Date(alert.triggeredAt).toLocaleString()}
告警ID: ${alert.id}

此告警由 FYMail 监控告警系统自动触发。
如需修改告警设置，请访问 FYMail 管理界面。
      `;
      
      // 发送邮件
      const result = await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text,
      });
      
      if (result.success) {
        console.log(`[MonitoringAlertSystem] Email notification sent for alert: ${alert.id} to ${recipientEmail}`);
      } else {
        console.error(`[MonitoringAlertSystem] Failed to send email notification for alert: ${alert.id}`, result.error);
      }
    } catch (error) {
      console.error(`[MonitoringAlertSystem] Error sending email notification for alert: ${alert.id}`, error);
    }
  }
  
  /**
   * 获取所有告警规则
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }
  
  /**
   * 获取告警规则
   */
  getAlertRule(ruleId: string): AlertRule | undefined {
    return this.alertRules.get(ruleId);
  }
  
  /**
   * 创建或更新告警规则
   */
  saveAlertRule(rule: AlertRule): void {
    const now = new Date().toISOString();
    
    // 如果是新规则，设置默认值
    if (!this.alertRules.has(rule.id)) {
      rule.triggerCount = 0;
    }
    
    this.alertRules.set(rule.id, rule);
  }
  
  /**
   * 删除告警规则
   */
  deleteAlertRule(ruleId: string): boolean {
    return this.alertRules.delete(ruleId);
  }
  
  /**
   * 静默告警规则
   */
  muteAlertRule(ruleId: string, muteUntil?: string): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;
    
    rule.muted = true;
    rule.mutedUntil = muteUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 默认静默24小时
    
    this.alertRules.set(ruleId, rule);
    return true;
  }
  
  /**
   * 取消静默告警规则
   */
  unmuteAlertRule(ruleId: string): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;
    
    rule.muted = false;
    rule.mutedUntil = undefined;
    
    this.alertRules.set(ruleId, rule);
    return true;
  }
  
  /**
   * 获取所有告警
   */
  getAlerts(options?: {
    acknowledged?: boolean;
    resolved?: boolean;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Alert[] {
    let filteredAlerts = [...this.alerts];
    
    if (options?.acknowledged !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === options.acknowledged);
    }
    
    if (options?.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === options.resolved);
    }
    
    if (options?.severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === options.severity);
    }
    
    if (options?.startDate) {
      const start = new Date(options.startDate);
      filteredAlerts = filteredAlerts.filter(alert => new Date(alert.triggeredAt) >= start);
    }
    
    if (options?.endDate) {
      const end = new Date(options.endDate);
      filteredAlerts = filteredAlerts.filter(alert => new Date(alert.triggeredAt) <= end);
    }
    
    if (options?.limit) {
      filteredAlerts = filteredAlerts.slice(0, options.limit);
    }
    
    return filteredAlerts;
  }
  
  /**
   * 获取未确认的告警数量
   */
  getUnacknowledgedAlertCount(): number {
    return this.alerts.filter(alert => !alert.acknowledged).length;
  }
  
  /**
   * 确认告警
   */
  acknowledgeAlert(alertId: string, userId?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;
    
    return true;
  }
  
  /**
   * 解决告警
   */
  resolveAlert(alertId: string, resolutionNotes?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolutionNotes = resolutionNotes;
    
    return true;
  }
  
  /**
   * 获取监控指标
   */
  getMetrics(options?: {
    metricType?: string;
    startDate?: string;
    endDate?: string;
    resourceId?: string;
    resourceType?: string;
    limit?: number;
  }): MetricDataPoint[] {
    let filteredMetrics = [...this.metricStore];
    
    if (options?.metricType) {
      filteredMetrics = filteredMetrics.filter(metric => metric.metricType === options.metricType);
    }
    
    if (options?.startDate) {
      const start = new Date(options.startDate);
      filteredMetrics = filteredMetrics.filter(metric => new Date(metric.timestamp) >= start);
    }
    
    if (options?.endDate) {
      const end = new Date(options.endDate);
      filteredMetrics = filteredMetrics.filter(metric => new Date(metric.timestamp) <= end);
    }
    
    if (options?.resourceId) {
      filteredMetrics = filteredMetrics.filter(metric => metric.resourceId === options.resourceId);
    }
    
    if (options?.resourceType) {
      filteredMetrics = filteredMetrics.filter(metric => metric.resourceType === options.resourceType);
    }
    
    if (options?.limit) {
      filteredMetrics = filteredMetrics.slice(0, options.limit);
    }
    
    return filteredMetrics;
  }
  
  /**
   * 获取监控摘要
   */
  getMonitoringSummary(): {
    totalAlerts: number;
    unacknowledgedAlerts: number;
    activeRules: number;
    totalMetrics: number;
    metricsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
  } {
    const metricsByType: Record<string, number> = {};
    this.metricStore.forEach(metric => {
      metricsByType[metric.metricType] = (metricsByType[metric.metricType] || 0) + 1;
    });
    
    const alertsBySeverity: Record<string, number> = {};
    this.alerts.forEach(alert => {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    });
    
    const activeRules = Array.from(this.alertRules.values()).filter(rule => rule.enabled).length;
    
    return {
      totalAlerts: this.alerts.length,
      unacknowledgedAlerts: this.getUnacknowledgedAlertCount(),
      activeRules,
      totalMetrics: this.metricStore.length,
      metricsByType,
      alertsBySeverity,
    };
  }
  
  /**
   * 清除旧数据
   */
  cleanupOldData(maxAgeDays: number = 30): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);
    
    // 清除旧指标
    this.metricStore = this.metricStore.filter(metric => {
      return new Date(metric.timestamp) >= cutoff;
    });
    
    // 清除已解决的旧告警
    this.alerts = this.alerts.filter(alert => {
      if (alert.resolved && new Date(alert.resolvedAt!) < cutoff) {
        return false;
      }
      return true;
    });
    
    console.log(`[MonitoringAlertSystem] Cleaned up data older than ${maxAgeDays} days`);
  }
}

// 默认导出单例
export const monitoringAlertSystem = new MonitoringAlertSystem();