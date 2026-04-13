'use client';

import { useState, useEffect } from 'react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricType: 'failureRate' | 'executionTime' | 'successRate' | 'errorCount' | 'cacheHitRate' | 'throughput';
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  threshold: number;
  timeWindowMinutes: number;
  evaluationIntervalMinutes: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  muted: boolean;
  mutedUntil?: string;
  cooldownMinutes: number;
  lastTriggeredAt?: string;
  triggerCount: number;
  notificationChannels: ('log' | 'email' | 'webhook' | 'slack' | 'dashboard')[];
}

interface Alert {
  id: string;
  ruleId: string;
  title: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
  resourceId?: string;
  resourceType?: string;
}

interface MonitoringSummary {
  totalAlerts: number;
  unacknowledgedAlerts: number;
  activeRules: number;
  totalMetrics: number;
  metricsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
}

interface AlertsPanelProps {
  onError?: (error: string) => void;
  onMessage?: (message: string) => void;
}

export default function AlertsPanel({ onError, onMessage }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'summary'>('alerts');
  const [alertFilter, setAlertFilter] = useState<'all' | 'unacknowledged' | 'unresolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [acknowledging, setAcknowledging] = useState<string | null>(null);
  
  useEffect(() => {
    loadAlertsData();
  }, []);
  
  async function loadAlertsData() {
    setLoading(true);
    try {
      // 加载告警和摘要
      const response = await fetch('/api/skills/monitoring-alerts?includeRules=true&summaryOnly=false');
      if (!response.ok) {
        throw new Error(`Failed to load alerts: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts || []);
        setRules(data.rules || []);
        
        // 如果有摘要则加载摘要
        if (data.summary) {
          setSummary(data.summary);
        } else {
          // 否则单独加载摘要
          const summaryResponse = await fetch('/api/skills/monitoring-alerts?summaryOnly=true');
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            if (summaryData.success) {
              setSummary(summaryData.summary);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Failed to load alerts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load alerts:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  
  async function acknowledgeAlert(alertId: string) {
    setAcknowledging(alertId);
    try {
      const response = await fetch('/api/skills/monitoring-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'acknowledgeAlert',
          alertId,
          userId: 'user' // 实际应用中应该使用真实用户ID
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to acknowledge alert: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        onMessage?.(`Alert acknowledged successfully`);
        // 刷新数据
        loadAlertsData();
      } else {
        throw new Error(data.message || 'Failed to acknowledge alert');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to acknowledge alert:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setAcknowledging(null);
    }
  }
  
  async function resolveAlert(alertId: string, resolutionNotes?: string) {
    try {
      const response = await fetch('/api/skills/monitoring-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'resolveAlert',
          alertId,
          resolutionNotes
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to resolve alert: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        onMessage?.(`Alert resolved successfully`);
        // 刷新数据
        loadAlertsData();
      } else {
        throw new Error(data.message || 'Failed to resolve alert');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to resolve alert:', errorMessage);
      onError?.(errorMessage);
    }
  }
  
  async function toggleRule(ruleId: string, enabled: boolean) {
    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;
      
      const response = await fetch('/api/skills/monitoring-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateRule',
          rule: { ...rule, enabled: !enabled }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update rule: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        onMessage?.(`Rule ${!enabled ? 'enabled' : 'disabled'} successfully`);
        // 刷新数据
        loadAlertsData();
      } else {
        throw new Error(data.message || 'Failed to update rule');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to toggle rule:', errorMessage);
      onError?.(errorMessage);
    }
  }
  
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  
  function formatTimeAgo(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      return `${diffDays}天前`;
    }
  }
  
  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff4d4f';
      case 'error': return '#ff7875';
      case 'warning': return '#faad14';
      case 'info': return '#1890ff';
      default: return '#d9d9d9';
    }
  }
  
  function getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'critical': return '严重';
      case 'error': return '错误';
      case 'warning': return '警告';
      case 'info': return '信息';
      default: return severity;
    }
  }
  
  // 过滤告警
  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'unacknowledged' && alert.acknowledged) return false;
    if (alertFilter === 'unresolved' && alert.resolved) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>加载告警数据中...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ 
        padding: '2rem', 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px',
        backgroundColor: '#fff',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            监控告警面板
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={loadAlertsData}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              刷新数据
            </button>
          </div>
        </div>
        
        {/* 标签页 */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '1.5rem',
        }}>
          <button
            onClick={() => setActiveTab('alerts')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'alerts' ? '#0070f3' : 'transparent',
              color: activeTab === 'alerts' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'alerts' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'alerts' ? 'bold' : 'normal',
            }}
          >
            告警 ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'rules' ? '#0070f3' : 'transparent',
              color: activeTab === 'rules' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'rules' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'rules' ? 'bold' : 'normal',
            }}
          >
            规则 ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'summary' ? '#0070f3' : 'transparent',
              color: activeTab === 'summary' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'summary' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'summary' ? 'bold' : 'normal',
            }}
          >
            摘要
          </button>
        </div>
        
        {/* 告警标签页 */}
        {activeTab === 'alerts' && (
          <>
            {/* 告警过滤器 */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>状态:</span>
                {(['all', 'unacknowledged', 'unresolved'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setAlertFilter(filter)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: alertFilter === filter ? '#0070f3' : '#f0f0f0',
                      color: alertFilter === filter ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    {filter === 'all' ? '全部' : 
                     filter === 'unacknowledged' ? '未确认' : '未解决'}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>严重性:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="all">全部</option>
                  <option value="critical">严重</option>
                  <option value="error">错误</option>
                  <option value="warning">警告</option>
                  <option value="info">信息</option>
                </select>
              </div>
              
              <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#666' }}>
                显示 {filteredAlerts.length} / {alerts.length} 告警
                {summary && (
                  <span style={{ marginLeft: '1rem' }}>
                    未确认: <strong>{summary.unacknowledgedAlerts}</strong>
                  </span>
                )}
              </div>
            </div>
            
            {/* 告警列表 */}
            {filteredAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                <p>没有匹配的告警</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredAlerts.map(alert => (
                  <div 
                    key={alert.id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: alert.acknowledged ? '#f9f9f9' : '#fff',
                      opacity: alert.resolved ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: getSeverityColor(alert.severity),
                            }}
                          />
                          <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
                            {alert.title}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: getSeverityColor(alert.severity),
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                            }}
                          >
                            {getSeverityLabel(alert.severity)}
                          </span>
                          {alert.acknowledged && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                backgroundColor: '#52c41a',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '12px',
                              }}
                            >
                              已确认
                            </span>
                          )}
                          {alert.resolved && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                backgroundColor: '#1890ff',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '12px',
                              }}
                            >
                              已解决
                            </span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                          规则: {alert.ruleId} | 触发时间: {formatTimestamp(alert.triggeredAt)} ({formatTimeAgo(alert.triggeredAt)})
                        </div>
                        
                        {alert.resourceId && (
                          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                            资源: {alert.resourceType ? `${alert.resourceType}/` : ''}{alert.resourceId}
                          </div>
                        )}
                        
                        {/* 告警详情 */}
                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>详情:</div>
                          <pre style={{ 
                            fontSize: '0.75rem', 
                            margin: 0, 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: '200px',
                            overflow: 'auto',
                          }}>
                            {JSON.stringify(alert.details, null, 2)}
                          </pre>
                        </div>
                        
                        {alert.resolutionNotes && (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>解决说明:</div>
                            <div style={{ fontSize: '0.875rem' }}>{alert.resolutionNotes}</div>
                            {alert.resolvedAt && (
                              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                解决时间: {formatTimestamp(alert.resolvedAt)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            disabled={acknowledging === alert.id}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#1890ff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            {acknowledging === alert.id ? '确认中...' : '确认告警'}
                          </button>
                        )}
                        
                        {!alert.resolved && (
                          <button
                            onClick={() => {
                              const notes = prompt('请输入解决说明:');
                              if (notes !== null) {
                                resolveAlert(alert.id, notes);
                              }
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#52c41a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            标记为已解决
                          </button>
                        )}
                        
                        <button
                          onClick={() => window.alert(JSON.stringify(alert, null, 2))}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          查看原始数据
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* 规则标签页 */}
        {activeTab === 'rules' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#666' }}>
                监控告警规则定义了何时触发告警的条件。规则基于指标数据（如失败率、执行时间等）进行触发。
              </p>
            </div>
            
            {rules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                <p>没有配置告警规则</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {rules.map(rule => (
                  <div 
                    key={rule.id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: rule.enabled ? '#fff' : '#f9f9f9',
                      opacity: rule.muted ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
                            {rule.name}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: rule.enabled ? '#52c41a' : '#ff4d4f',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                            }}
                          >
                            {rule.enabled ? '已启用' : '已禁用'}
                          </span>
                          {rule.muted && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                backgroundColor: '#faad14',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '12px',
                              }}
                            >
                              已静默
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: getSeverityColor(rule.severity),
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                            }}
                          >
                            {getSeverityLabel(rule.severity)}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                          {rule.description}
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.75rem', color: '#888' }}>
                          <div>
                            <strong>指标类型:</strong> {rule.metricType}
                          </div>
                          <div>
                            <strong>条件:</strong> {rule.metricType} {rule.operator} {rule.threshold}
                          </div>
                          <div>
                            <strong>时间窗口:</strong> {rule.timeWindowMinutes}分钟
                          </div>
                          <div>
                            <strong>评估间隔:</strong> {rule.evaluationIntervalMinutes}分钟
                          </div>
                          <div>
                            <strong>触发次数:</strong> {rule.triggerCount}
                          </div>
                          <div>
                            <strong>冷却时间:</strong> {rule.cooldownMinutes}分钟
                          </div>
                          {rule.lastTriggeredAt && (
                            <div>
                              <strong>最后触发:</strong> {formatTimeAgo(rule.lastTriggeredAt)}
                            </div>
                          )}
                          {rule.mutedUntil && (
                            <div>
                              <strong>静默直到:</strong> {formatTimestamp(rule.mutedUntil)}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#666' }}>
                          <strong>通知渠道:</strong> {rule.notificationChannels.join(', ')}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                        <button
                          onClick={() => toggleRule(rule.id, rule.enabled)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: rule.enabled ? '#ff4d4f' : '#52c41a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          {rule.enabled ? '禁用规则' : '启用规则'}
                        </button>
                        
                        <button
                          onClick={() => alert(JSON.stringify(rule, null, 2))}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          查看配置
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
              <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>关于告警规则</h5>
              <ul style={{ fontSize: '0.875rem', color: '#666', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                <li>告警规则监控特定指标，当条件满足时触发告警</li>
                <li>每个规则都有严重性级别（信息、警告、错误、严重）</li>
                <li>规则可以启用/禁用，也可以临时静默</li>
                <li>触发后，规则会进入冷却时间，防止重复触发</li>
                <li>告警可以通过仪表板、日志、邮件等方式通知</li>
              </ul>
            </div>
          </>
        )}
        
        {/* 摘要标签页 */}
        {activeTab === 'summary' && summary && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>监控系统概览</h4>
              
              {/* 关键指标卡片 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#e6f7ff',
                  border: '1px solid #91d5ff',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>总告警数</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.totalAlerts}</div>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>未确认告警</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4d4f' }}>{summary.unacknowledgedAlerts}</div>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>活动规则</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#52c41a' }}>{summary.activeRules}</div>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>指标数据点</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.totalMetrics}</div>
                </div>
              </div>
              
              {/* 告警按严重性分布 */}
              <div style={{ marginBottom: '2rem' }}>
                <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>告警按严重性分布</h5>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {Object.entries(summary.alertsBySeverity).map(([severity, count]) => (
                    <div 
                      key={severity}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: getSeverityColor(severity),
                        color: 'white',
                        borderRadius: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>{getSeverityLabel(severity)}</span>
                      <span style={{ fontSize: '0.875rem' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 指标按类型分布 */}
              <div style={{ marginBottom: '2rem' }}>
                <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>指标按类型分布</h5>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {Object.entries(summary.metricsByType).map(([type, count]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ minWidth: '150px', fontSize: '0.875rem' }}>{type}</div>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            backgroundColor: '#1890ff',
                            width: `${Math.min(100, (count / summary.totalMetrics) * 100)}%`,
                          }}
                        />
                      </div>
                      <div style={{ minWidth: '60px', fontSize: '0.875rem', textAlign: 'right' }}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
              <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>系统状态</h5>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  {summary.unacknowledgedAlerts > 0 ? (
                    <span style={{ color: '#ff4d4f' }}>
                      ⚠️ 系统中有 {summary.unacknowledgedAlerts} 个未确认告警，请及时处理。
                    </span>
                  ) : (
                    <span style={{ color: '#52c41a' }}>✓ 所有告警均已确认。</span>
                  )}
                </p>
                <p>
                  监控系统正在运行，跟踪 {summary.totalMetrics} 个指标数据点和 {summary.activeRules} 个活动规则。
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}