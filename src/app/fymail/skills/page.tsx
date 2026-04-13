/**
 * FYMail Skills Management Page
 * 技能管理、状态监控、执行日志查看
 */

'use client';

import { useEffect, useState } from 'react';
import AlertsPanel from '@/components/SkillsPanels/AlertsPanel';
import ABTestingPanel from '@/components/SkillsPanels/ABTestingPanel';
import TrendAnalysisPanel from '@/components/SkillsPanels/TrendAnalysisPanel';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  version: string;
  integrationPoints: Array<{
    id: string;
    name: string;
    workflowStage: string;
    trigger: string;
    priority: number;
    enabled: boolean;
  }>;
}

interface SkillExecutionLog {
  id: string;
  skillId: string;
  skillName: string;
  executionType: 'skill' | 'workflowStage';
  workflowStage?: string;
  contextSummary: Record<string, any>;
  params?: Record<string, any>;
  result: {
    success: boolean;
    message?: string;
    error?: string;
    data?: Record<string, any>;
    durationMs: number;
  };
  timestamp: string;
  userId?: string;
  sessionId?: string;
  archived: boolean;
}

type ViewType = 'skills' | 'logs' | 'strategies' | 'monitoring' | 'alerts' | 'abtesting' | 'trends';

export default function SkillsManagementPage() {
  const [activeView, setActiveView] = useState<ViewType>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [logs, setLogs] = useState<SkillExecutionLog[]>([]);
  const [logStats, setLogStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // 策略面板状态
  const [strategies, setStrategies] = useState<any[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<any>(null);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  
  // enrichment监控状态
  const [monitoringMetrics, setMonitoringMetrics] = useState<any>(null);
  const [monitoringSteps, setMonitoringSteps] = useState<any[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  
  // 技能系统配置
  const [skillsConfig, setSkillsConfig] = useState<any>(null);

  useEffect(() => {
    // 加载技能系统配置
    async function loadSkillsConfig() {
      try {
        const response = await fetch('/api/skills/health');
        if (response.ok) {
          const data = await response.json();
          setSkillsConfig(data.config || {});
        }
      } catch (err) {
        console.error('Failed to load skills config:', err);
      }
    }
    
    loadSkillsConfig();
    
    if (activeView === 'skills') {
      loadSkills();
    } else if (activeView === 'logs') {
      loadLogs();
    } else if (activeView === 'strategies') {
      loadStrategies();
    } else if (activeView === 'monitoring') {
      loadMonitoring();
    }
    // 新视图不需要加载数据，它们有自己的数据加载逻辑
  }, [activeView]);

  async function loadSkills() {
    setLoading(true);
    try {
      const response = await fetch('/api/skills/execute');
      if (!response.ok) {
        throw new Error(`Failed to load skills: ${response.status}`);
      }
      const data = await response.json();
      setSkills(data.skills || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const response = await fetch('/api/skills/logs?limit=50');
      if (!response.ok) {
        throw new Error(`Failed to load logs: ${response.status}`);
      }
      const data = await response.json();
      setLogs(data.logs || []);
      setLogStats(data.stats || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLogsLoading(false);
    }
  }

  async function loadStrategies() {
    setStrategiesLoading(true);
    try {
      const response = await fetch('/api/skills/strategies');
      if (!response.ok) {
        throw new Error(`Failed to load strategies: ${response.status}`);
      }
      const data = await response.json();
      setStrategies(data.strategies || []);
      setActiveStrategy(data.activeStrategy || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setStrategiesLoading(false);
    }
  }

  async function discoverSkills() {
    setDiscovering(true);
    setMessage(null);
    try {
      const response = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' }),
      });
      if (!response.ok) {
        throw new Error(`Discovery failed: ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.message || 'Skills discovered successfully');
      // 重新加载技能列表
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
    } finally {
      setDiscovering(false);
    }
  }

  async function toggleSkill(skillId: string, enabled: boolean) {
    try {
      const response = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle',
          skillId,
          enabled: !enabled 
        }),
      });
      if (!response.ok) {
        throw new Error(`Toggle failed: ${response.status}`);
      }
      // 更新本地状态
      setSkills(prev => prev.map(skill => 
        skill.id === skillId ? { ...skill, enabled: !enabled } : skill
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    }
  }

  async function executeSkill(skillId: string) {
    try {
      const response = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          skillId,
          context: { workflowStage: 'contact-acquisition' }
        }),
      });
      if (!response.ok) {
        throw new Error(`Execution failed: ${response.status}`);
      }
      const data = await response.json();
      alert(`Skill executed: ${JSON.stringify(data.result, null, 2)}`);
      // 重新加载日志以显示新执行
      if (activeView === 'logs') {
        loadLogs();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
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

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  async function loadMonitoring() {
    setMonitoringLoading(true);
    try {
      const response = await fetch('/api/skills/enrichment-monitoring');
      if (!response.ok) {
        throw new Error(`Failed to load monitoring data: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setMonitoringMetrics(data.metrics);
        setMonitoringSteps(data.steps);
      } else {
        throw new Error(data.message || 'Unknown error');
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monitoring data');
    } finally {
      setMonitoringLoading(false);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          FYMail Skills Management
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          技能配置入口 - 管理自动发现的技能、查看执行日志、配置批量发送策略
        </p>
        
        {/* 视图切换标签 */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setActiveView('skills')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeView === 'skills' ? '#0070f3' : 'transparent',
              color: activeView === 'skills' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeView === 'skills' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === 'skills' ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            技能列表
          </button>
          <button
            onClick={() => setActiveView('logs')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeView === 'logs' ? '#0070f3' : 'transparent',
              color: activeView === 'logs' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeView === 'logs' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === 'logs' ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            执行日志
          </button>
          <button
            onClick={() => setActiveView('strategies')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeView === 'strategies' ? '#0070f3' : 'transparent',
              color: activeView === 'strategies' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeView === 'strategies' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === 'strategies' ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            策略面板
          </button>
          <button
            onClick={() => setActiveView('monitoring')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeView === 'monitoring' ? '#0070f3' : 'transparent',
              color: activeView === 'monitoring' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeView === 'monitoring' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === 'monitoring' ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            Enrichment监控
          </button>
          <button
            onClick={() => setActiveView('alerts')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeView === 'alerts' ? '#0070f3' : 'transparent',
              color: activeView === 'alerts' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeView === 'alerts' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === 'alerts' ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            告警面板
          </button>
          <button
            onClick={() => setActiveView('abtesting')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeView === 'abtesting' ? '#0070f3' : 'transparent',
              color: activeView === 'abtesting' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeView === 'abtesting' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === 'abtesting' ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            A/B测试结果
          </button>
          <button
            onClick={() => setActiveView('trends')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeView === 'trends' ? '#0070f3' : 'transparent',
              color: activeView === 'trends' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeView === 'trends' ? '2px solid #0070f3' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === 'trends' ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            趋势分析
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={discoverSkills}
            disabled={discovering}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {discovering ? 'Discovering...' : 'Discover New Skills'}
          </button>
          <button
            onClick={() => activeView === 'skills' ? loadSkills() : loadLogs()}
            disabled={loading || logsLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Refresh {activeView === 'skills' ? 'Skills' : 'Logs'}
          </button>
          <a
            href="/fymail"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Back to FYMail
          </a>
        </div>
        
        {message && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            marginBottom: '1rem',
            color: '#ff4d4f',
          }}>
            Error: {error}
          </div>
        )}
      </header>

      {/* 技能列表视图 */}
      {activeView === 'skills' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading skills...</p>
            </div>
          ) : skills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
              <p>No skills found. Try discovering skills from the skills directory.</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem', color: '#666' }}>
                Found {skills.length} skills (built-in and discovered)
              </div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {skills.map(skill => (
                  <div 
                    key={skill.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      backgroundColor: skill.enabled ? '#fff' : '#f9f9f9',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {skill.name}
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#e0e0e0',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '12px',
                            marginLeft: '0.5rem',
                            verticalAlign: 'middle',
                          }}>
                            {skill.category}
                          </span>
                        </h3>
                        <p style={{ color: '#666', marginBottom: '0.5rem' }}>{skill.description}</p>
                        <div style={{ fontSize: '0.875rem', color: '#888' }}>
                          ID: {skill.id} | Version: {skill.version} | 
                          Status: <span style={{ color: skill.enabled ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                            {skill.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => toggleSkill(skill.id, skill.enabled)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: skill.enabled ? '#ff4d4f' : '#52c41a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          {skill.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => executeSkill(skill.id)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          Test Execute
                        </button>
                      </div>
                    </div>
                    
                    {skill.integrationPoints && skill.integrationPoints.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Integration Points</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                          {skill.integrationPoints.map(point => (
                            <div 
                              key={point.id}
                              style={{
                                padding: '0.75rem',
                                backgroundColor: point.enabled ? '#f6ffed' : '#f9f9f9',
                                border: `1px solid ${point.enabled ? '#b7eb8f' : '#e0e0e0'}`,
                                borderRadius: '4px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong style={{ display: 'block' }}>{point.name}</strong>
                                  <span style={{ fontSize: '0.75rem', color: '#666' }}>{point.workflowStage}</span>
                                </div>
                                <span style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: point.enabled ? '#52c41a' : '#ff4d4f',
                                  color: 'white',
                                  padding: '0.125rem 0.5rem',
                                  borderRadius: '12px',
                                }}>
                                  {point.enabled ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                                Trigger: {point.trigger} | Priority: {point.priority}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 执行日志视图 */}
      {activeView === 'logs' && (
        <>
          {logStats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '4px',
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Executions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{logStats.totalExecutions}</div>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '4px',
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Successful</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#52c41a' }}>{logStats.successfulExecutions}</div>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: '4px',
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Failed</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4d4f' }}>{logStats.failedExecutions}</div>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f0f0',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Avg Duration</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatDuration(logStats.averageDurationMs)}</div>
              </div>
            </div>
          )}
          
          {logsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
              <p>No execution logs found. Try executing a skill first.</p>
            </div>
          ) : (
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Skill</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Duration</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{log.skillName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{log.skillId}</div>
                        {log.workflowStage && (
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{log.workflowStage}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: log.executionType === 'skill' ? '#e6f7ff' : '#f6ffed',
                          color: log.executionType === 'skill' ? '#1890ff' : '#52c41a',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                        }}>
                          {log.executionType}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        {formatDuration(log.result.durationMs)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: log.result.success ? '#f6ffed' : '#fff2f0',
                          color: log.result.success ? '#52c41a' : '#ff4d4f',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                        }}>
                          {log.result.success ? 'Success' : 'Failed'}
                        </span>
                        {log.result.message && (
                          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                            {log.result.message.length > 50 ? `${log.result.message.substring(0, 50)}...` : log.result.message}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => alert(JSON.stringify(log, null, 2))}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 策略面板视图 */}
      {activeView === 'strategies' && (
        <div>
          <div style={{ 
            padding: '2rem', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            backgroundColor: '#fff',
            marginBottom: '2rem',
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              批量发送策略面板
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              配置和管理批量发送优化策略，实现可控的发送流程。
            </p>
            
            {strategiesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading strategies...</p>
              </div>
            ) : strategies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                <p>No strategies found. Loading presets...</p>
              </div>
            ) : (
              <>
                {/* 活动策略显示 */}
                {activeStrategy && (
                  <div style={{ 
                    padding: '1.5rem', 
                    backgroundColor: '#e6f7ff', 
                    border: '1px solid #91d5ff',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          当前活动策略: {activeStrategy.name}
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#52c41a',
                            color: 'white',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '12px',
                            marginLeft: '0.5rem',
                          }}>
                            ACTIVE
                          </span>
                        </h4>
                        <p style={{ color: '#666' }}>{activeStrategy.description}</p>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#888' }}>
                        批次大小: {activeStrategy.batching.batchSize} | 
                        个性化: {activeStrategy.personalization.level} | 
                        质量要求: {activeStrategy.filtering.minDataQuality}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => alert(JSON.stringify(activeStrategy, null, 2))}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#1890ff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        查看详细配置
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Apply this strategy to all new bulk send jobs?')) {
                            // 这里可以调用API设置默认策略
                            alert('Strategy set as default (implementation pending)');
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#52c41a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        设为默认
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 策略列表 */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>可用策略</h4>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {strategies.map(strategy => (
                      <div 
                        key={strategy.id}
                        style={{
                          padding: '1.5rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          backgroundColor: strategy.id === activeStrategy?.id ? '#f6ffed' : '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h5 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                              {strategy.name}
                              {strategy.id === activeStrategy?.id && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: '#52c41a',
                                  color: 'white',
                                  padding: '0.125rem 0.5rem',
                                  borderRadius: '12px',
                                  marginLeft: '0.5rem',
                                }}>
                                  当前活动
                                </span>
                              )}
                            </h5>
                            <p style={{ color: '#666', marginBottom: '0.5rem' }}>{strategy.description}</p>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888' }}>
                              <span>批次: {strategy.batching.batchSize}</span>
                              <span>延迟: {strategy.batching.delayBetweenBatches}min</span>
                              <span>个性化: {strategy.personalization.level}</span>
                              <span>质量: {strategy.filtering.minDataQuality}</span>
                              <span>AB测试: {strategy.abTesting.enabled ? '是' : '否'}</span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/skills/strategies', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      action: 'setActive',
                                      strategyId: strategy.id 
                                    }),
                                  });
                                  if (!response.ok) throw new Error('Failed to set active');
                                  const data = await response.json();
                                  setActiveStrategy(data.activeStrategy);
                                  setMessage(`策略 "${strategy.name}" 已设为活动策略`);
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Failed to activate strategy');
                                }
                              }}
                              disabled={strategy.id === activeStrategy?.id}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: strategy.id === activeStrategy?.id ? '#f0f0f0' : '#1890ff',
                                color: strategy.id === activeStrategy?.id ? '#666' : 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: strategy.id === activeStrategy?.id ? 'default' : 'pointer',
                              }}
                            >
                              {strategy.id === activeStrategy?.id ? '已激活' : '激活'}
                            </button>
                            <button
                              onClick={() => alert(JSON.stringify(strategy, null, 2))}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              查看
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 策略配置概览 */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>策略配置概览</h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '1rem',
                  }}>
                    <div style={{ padding: '1rem', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                      <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>发送策略优化</h5>
                      <ul style={{ fontSize: '0.875rem', color: '#666', paddingLeft: '1rem' }}>
                        <li>智能分批发送</li>
                        <li>发送时间优化</li>
                        <li>个性化级别控制</li>
                        <li>A/B测试配置</li>
                      </ul>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px' }}>
                      <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>联系人筛选</h5>
                      <ul style={{ fontSize: '0.875rem', color: '#666', paddingLeft: '1rem' }}>
                        <li>数据质量过滤</li>
                        <li>地域分组</li>
                        <li>行业细分</li>
                        <li>互动历史筛选</li>
                      </ul>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '4px' }}>
                      <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>性能监控</h5>
                      <ul style={{ fontSize: '0.875rem', color: '#666', paddingLeft: '1rem' }}>
                        <li>实时发送跟踪</li>
                        <li>打开/点击率监控</li>
                        <li>退订/投诉预警</li>
                        <li>自动化调整</li>
                      </ul>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#f0f0f0', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                      <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>合规与安全</h5>
                      <ul style={{ fontSize: '0.875rem', color: '#666', paddingLeft: '1rem' }}>
                        <li>GDPR合规检查</li>
                        <li>发送频率限制</li>
                        <li>退订机制</li>
                        <li>黑名单管理</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={loadStrategies}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    刷新策略
                  </button>
                  <button
                    onClick={() => alert('Create new strategy feature coming soon')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    创建新策略
                  </button>
                  <button
                    onClick={() => alert('Import contacts to optimize strategy')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    优化策略（基于联系人）
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* 现有技能集成策略预览 */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>当前可用策略（通过技能集成）</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>邮件营销自动化技能</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  提供发送策略优化、批次大小调整、发送时间建议和性能预测。
                </p>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  集成点：模板设计、活动策划、发送策略优化、性能监控
                </div>
              </div>
              <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>冷邮件外展技能</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  提供区域特定的发送策略、本地化模板和文化洞察。
                </p>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  集成点：模板本地化、区域策略、时间优化
                </div>
              </div>
              <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>数据增强工具技能</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  提供数据质量评分和联系人筛选，优化发送列表质量。
                </p>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  集成点：联系人验证、联系人增强、数据质量评分
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrichment监控视图 */}
      {activeView === 'monitoring' && (
        <div>
          <div style={{ 
            padding: '2rem', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            backgroundColor: '#fff',
            marginBottom: '2rem',
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Enrichment Pipeline Monitoring
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              联系人数据增强管道的实时监控指标和性能分析。
            </p>
            
            {monitoringLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading monitoring data...</p>
              </div>
            ) : monitoringMetrics ? (
              <>
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
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Calls</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{monitoringMetrics.totalCalls}</div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Successful Calls</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#52c41a' }}>
                      {monitoringMetrics.totalCalls - monitoringMetrics.failedCalls}
                    </div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Failed Calls</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4d4f' }}>{monitoringMetrics.failedCalls}</div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Success Rate</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {monitoringMetrics.successRate ? (monitoringMetrics.successRate * 100).toFixed(1) + '%' : 'N/A'}
                    </div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f9f0ff',
                    border: '1px solid #d3adf7',
                    borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Avg Duration</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {formatDuration(monitoringMetrics.averageDurationMs || 0)}
                    </div>
                  </div>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff7e6',
                    border: '1px solid #ffd591',
                    borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>Cache Size</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{monitoringMetrics.cacheSize || 0}</div>
                  </div>
                </div>
                
                {/* 步骤状态 */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Enrichment Steps</h4>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {monitoringSteps.map((step, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '1rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          backgroundColor: step.enabled ? '#fff' : '#f9f9f9',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h5 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{step.name}</h5>
                            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>{step.description}</p>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>
                              工作流阶段: {step.workflowStage} | 
                              状态: <span style={{ color: step.enabled ? '#52c41a' : '#ff4d4f' }}>
                                {step.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={loadMonitoring}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    刷新监控数据
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/skills/enrichment-monitoring?resetCache=true');
                        if (response.ok) {
                          alert('Cache cleared successfully');
                          loadMonitoring();
                        } else {
                          alert('Failed to clear cache');
                        }
                      } catch (err) {
                        alert('Error clearing cache');
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    清除缓存
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                <p>No monitoring data available. The enrichment pipeline may not have been used yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 告警面板 */}
      {activeView === 'alerts' && (
        <AlertsPanel 
          onError={setError}
          onMessage={setMessage}
        />
      )}
      
      {/* A/B测试结果面板 */}
      {activeView === 'abtesting' && (
        <ABTestingPanel 
          onError={setError}
          onMessage={setMessage}
        />
      )}
      
      {/* 趋势分析面板 */}
      {activeView === 'trends' && (
        <TrendAnalysisPanel 
          onError={setError}
          onMessage={setMessage}
        />
      )}
      
      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0', color: '#888', fontSize: '0.875rem' }}>
        <p>
          <strong>Skills Directory:</strong> {skillsConfig?.skillsDirectory || '/home/ubuntu/.openclaw/workspace/skills'}<br />
          <strong>Auto-discovery:</strong> Scans for SKILL.md files and loads capabilities.<br />
          <strong>Integration:</strong> Skills can be executed at various workflow stages (contact acquisition, enrichment, template design, etc.)
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <strong>Phase 8 Progress:</strong> 
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> 策略推荐任务集成 |
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> 告警面板集成 |
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> A/B测试结果页面 |
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> 历史趋势分析可视化 |
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> 技能状态/日志前端展示 |
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> 联系人enrichment强化 |
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> 批量发送策略面板 |
          <span style={{ color: '#52c41a', marginLeft: '0.5rem' }}>✓</span> Enrichment监控可视化
        </p>
      </footer>
    </div>
  );
}