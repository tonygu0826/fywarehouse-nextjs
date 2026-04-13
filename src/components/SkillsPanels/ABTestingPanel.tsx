'use client';

import { useState, useEffect } from 'react';

interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  element: 'subject' | 'content' | 'sender' | 'timing' | 'strategy' | 'template';
  goal: 'open-rate' | 'click-rate' | 'reply-rate' | 'conversion' | 'engagement';
  variants: ABTestVariant[];
  audience?: {
    size: number;
    filters?: Record<string, any>;
  };
  durationHours: number;
  samplingRate: number;
  confidenceLevel: number;
  minimumDetectableEffect: number;
  enabled: boolean;
  startTime?: string;
  endTime?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface ABTestVariant {
  variantId: string;
  name: string;
  description: string;
  config: Record<string, any>;
  weight: number;
  isControl: boolean;
}

interface ABTestResult {
  testId: string;
  calculatedAt: string;
  totalExposures: number;
  totalConversions: number;
  overallConversionRate: number;
  variantResults: ABTestVariantResult[];
  statisticalSignificance: {
    isSignificant: boolean;
    pValue: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    effectSize: number;
  };
  winner?: {
    variantId: string;
    confidence: number;
    improvement: number;
  };
  recommendations: string[];
}

interface ABTestVariantResult {
  variantId: string;
  exposures: number;
  conversions: number;
  conversionRate: number;
  standardError: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  relativeImprovement?: number;
}

interface ABTestingPanelProps {
  onError?: (error: string) => void;
  onMessage?: (message: string) => void;
}

export default function ABTestingPanel({ onError, onMessage }: ABTestingPanelProps) {
  const [tests, setTests] = useState<ABTestConfig[]>([]);
  const [results, setResults] = useState<Record<string, ABTestResult>>({});
  const [loading, setLoading] = useState(true);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [testFilter, setTestFilter] = useState<string>('all');
  
  useEffect(() => {
    loadTests();
  }, []);
  
  async function loadTests() {
    setLoading(true);
    try {
      const response = await fetch('/api/skills/ab-testing');
      if (!response.ok) {
        throw new Error(`Failed to load A/B tests: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success) {
        setTests(data.tests || []);
        setSummary(data.summary || null);
        
        // 为每个测试加载结果
        const resultsMap: Record<string, ABTestResult> = {};
        const testsWithResults = data.tests.filter((test: ABTestConfig) => 
          test.status === 'active' || test.status === 'completed'
        );
        
        // 只加载前3个测试的结果以避免过多请求
        for (const test of testsWithResults.slice(0, 3)) {
          try {
            const resultResponse = await fetch(`/api/skills/ab-testing?testId=${test.testId}&includeResults=true`);
            if (resultResponse.ok) {
              const resultData = await resultResponse.json();
              if (resultData.success && resultData.results) {
                resultsMap[test.testId] = resultData.results;
              }
            }
          } catch (err) {
            console.error(`Failed to load results for test ${test.testId}:`, err);
          }
        }
        
        setResults(resultsMap);
        
        // 设置第一个测试为活动测试
        if (data.tests.length > 0 && !activeTestId) {
          setActiveTestId(data.tests[0].testId);
        }
      } else {
        throw new Error(data.message || 'Failed to load A/B tests');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load A/B tests:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  
  async function loadTestResults(testId: string) {
    try {
      const response = await fetch(`/api/skills/ab-testing?testId=${testId}&includeResults=true`);
      if (!response.ok) {
        throw new Error(`Failed to load test results: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.results) {
        setResults(prev => ({
          ...prev,
          [testId]: data.results,
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Failed to load results for test ${testId}:`, errorMessage);
      onError?.(errorMessage);
    }
  }
  
  async function startTest(testId: string) {
    try {
      const response = await fetch('/api/skills/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'startTest',
          testId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start test: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        onMessage?.(`Test "${data.test?.name}" started successfully`);
        loadTests(); // 刷新测试列表
      } else {
        throw new Error(data.message || 'Failed to start test');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to start test:', errorMessage);
      onError?.(errorMessage);
    }
  }
  
  async function pauseTest(testId: string) {
    try {
      const response = await fetch('/api/skills/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'pauseTest',
          testId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to pause test: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        onMessage?.(`Test "${data.test?.name}" paused successfully`);
        loadTests(); // 刷新测试列表
      } else {
        throw new Error(data.message || 'Failed to pause test');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to pause test:', errorMessage);
      onError?.(errorMessage);
    }
  }
  
  async function completeTest(testId: string) {
    try {
      const response = await fetch('/api/skills/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'completeTest',
          testId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete test: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        onMessage?.(`Test "${data.test?.name}" completed successfully`);
        loadTests(); // 刷新测试列表
      } else {
        throw new Error(data.message || 'Failed to complete test');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to complete test:', errorMessage);
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
    });
  }
  
  function formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours}小时`;
    } else {
      return `${(hours / 24).toFixed(1)}天`;
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#52c41a';
      case 'completed': return '#1890ff';
      case 'paused': return '#faad14';
      case 'draft': return '#d9d9d9';
      case 'archived': return '#666';
      default: return '#d9d9d9';
    }
  }
  
  function getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'paused': return '已暂停';
      case 'draft': return '草稿';
      case 'archived': return '已归档';
      default: return status;
    }
  }
  
  function getGoalLabel(goal: string): string {
    switch (goal) {
      case 'open-rate': return '打开率';
      case 'click-rate': return '点击率';
      case 'reply-rate': return '回复率';
      case 'conversion': return '转化率';
      case 'engagement': return '互动率';
      default: return goal;
    }
  }
  
  function getElementLabel(element: string): string {
    switch (element) {
      case 'subject': return '主题行';
      case 'content': return '内容';
      case 'sender': return '发件人';
      case 'timing': return '发送时间';
      case 'strategy': return '发送策略';
      case 'template': return '模板';
      default: return element;
    }
  }
  
  // 过滤测试
  const filteredTests = tests.filter(test => {
    if (testFilter === 'all') return true;
    return test.status === testFilter;
  });
  
  // 获取活动测试
  const activeTest = activeTestId ? tests.find(test => test.testId === activeTestId) : null;
  const activeTestResults = activeTestId ? results[activeTestId] : null;
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>加载A/B测试数据中...</p>
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
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              A/B测试结果面板
            </h3>
            <p style={{ color: '#666' }}>
              查看和分析邮件营销A/B测试的结果，优化发送策略和模板效果。
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={loadTests}
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
            <button
              onClick={() => alert('创建新测试功能即将推出')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              创建新测试
            </button>
          </div>
        </div>
        
        {/* 测试摘要 */}
        {summary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>总测试数</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tests.length}</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>进行中</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#52c41a' }}>{summary.active}</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>已完成</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1890ff' }}>{summary.completed}</div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f0f0f0',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>草稿</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>{summary.draft}</div>
            </div>
          </div>
        )}
        
        {/* 两栏布局：测试列表和测试详情 */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* 左侧：测试列表 */}
          <div style={{ borderRight: '1px solid #e0e0e0', paddingRight: '1rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>测试列表</h4>
              
              {/* 过滤器 */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {(['all', 'active', 'completed', 'paused', 'draft'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTestFilter(filter)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: testFilter === filter ? '#0070f3' : '#f0f0f0',
                      color: testFilter === filter ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    {filter === 'all' ? '全部' : 
                     filter === 'active' ? '进行中' :
                     filter === 'completed' ? '已完成' :
                     filter === 'paused' ? '已暂停' : '草稿'}
                    {summary && filter !== 'all' && (
                      <span style={{ marginLeft: '0.25rem' }}>
                        ({summary[filter] || 0})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* 测试列表 */}
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {filteredTests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                    <p>没有测试</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {filteredTests.map(test => (
                      <div
                        key={test.testId}
                        onClick={() => {
                          setActiveTestId(test.testId);
                          // 如果还没有加载结果，则加载
                          if (!results[test.testId] && (test.status === 'active' || test.status === 'completed')) {
                            loadTestResults(test.testId);
                          }
                        }}
                        style={{
                          padding: '1rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          backgroundColor: activeTestId === test.testId ? '#e6f7ff' : '#fff',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h5 style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>{test.name}</h5>
                          <span
                            style={{
                              fontSize: '0.625rem',
                              backgroundColor: getStatusColor(test.status),
                              color: 'white',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '10px',
                            }}
                          >
                            {getStatusLabel(test.status)}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                          目标: {getGoalLabel(test.goal)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                          元素: {getElementLabel(test.element)}
                        </div>
                        
                        <div style={{ fontSize: '0.625rem', color: '#888' }}>
                          {test.startTime ? (
                            <div>开始: {formatTimestamp(test.startTime)}</div>
                          ) : (
                            <div>创建: {formatTimestamp(test.createdAt)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 右侧：测试详情 */}
          <div>
            {activeTest ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {activeTest.name}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: getStatusColor(activeTest.status),
                          color: 'white',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '12px',
                          marginLeft: '0.5rem',
                          verticalAlign: 'middle',
                        }}
                      >
                        {getStatusLabel(activeTest.status)}
                      </span>
                    </h4>
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>{activeTest.description}</p>
                    
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888' }}>
                      <div>
                        <strong>测试元素:</strong> {getElementLabel(activeTest.element)}
                      </div>
                      <div>
                        <strong>目标指标:</strong> {getGoalLabel(activeTest.goal)}
                      </div>
                      <div>
                        <strong>置信水平:</strong> {activeTest.confidenceLevel * 100}%
                      </div>
                      <div>
                        <strong>采样率:</strong> {activeTest.samplingRate * 100}%
                      </div>
                    </div>
                    
                    {activeTest.audience && (
                      <div style={{ fontSize: '0.875rem', color: '#888', marginTop: '0.5rem' }}>
                        <strong>受众规模:</strong> {activeTest.audience.size} 联系人
                      </div>
                    )}
                    
                    <div style={{ fontSize: '0.875rem', color: '#888', marginTop: '0.5rem' }}>
                      {activeTest.startTime && (
                        <span style={{ marginRight: '1rem' }}>
                          <strong>开始时间:</strong> {formatTimestamp(activeTest.startTime)}
                        </span>
                      )}
                      {activeTest.endTime && (
                        <span>
                          <strong>结束时间:</strong> {formatTimestamp(activeTest.endTime)}
                        </span>
                      )}
                      {!activeTest.endTime && activeTest.durationHours > 0 && (
                        <span>
                          <strong>持续时间:</strong> {formatDuration(activeTest.durationHours)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                    {activeTest.status === 'draft' && (
                      <button
                        onClick={() => startTest(activeTest.testId)}
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
                        开始测试
                      </button>
                    )}
                    
                    {activeTest.status === 'active' && (
                      <>
                        <button
                          onClick={() => pauseTest(activeTest.testId)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#faad14',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          暂停测试
                        </button>
                        <button
                          onClick={() => completeTest(activeTest.testId)}
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
                          完成测试
                        </button>
                      </>
                    )}
                    
                    {activeTest.status === 'paused' && (
                      <button
                        onClick={() => startTest(activeTest.testId)}
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
                        恢复测试
                      </button>
                    )}
                    
                    <button
                      onClick={() => loadTestResults(activeTest.testId)}
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
                      刷新结果
                    </button>
                  </div>
                </div>
                
                {/* 变体配置 */}
                <div style={{ marginBottom: '2rem' }}>
                  <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>测试变体</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {activeTest.variants.map(variant => (
                      <div 
                        key={variant.variantId}
                        style={{
                          padding: '1rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          backgroundColor: variant.isControl ? '#f6ffed' : '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h6 style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
                            {variant.name}
                            {variant.isControl && (
                              <span style={{ fontSize: '0.625rem', color: '#52c41a', marginLeft: '0.5rem' }}>
                                (控制组)
                              </span>
                            )}
                          </h6>
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            权重: {Math.round(variant.weight * 100)}%
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                          {variant.description}
                        </p>
                        
                        <div style={{ fontSize: '0.625rem', color: '#888' }}>
                          <pre style={{ 
                            margin: 0, 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: '100px',
                            overflow: 'auto',
                          }}>
                            {JSON.stringify(variant.config, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 测试结果 */}
                {activeTestResults ? (
                  <div>
                    <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>测试结果</h5>
                    
                    <div style={{ 
                      padding: '1.5rem', 
                      backgroundColor: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: '8px',
                      marginBottom: '2rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h6 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>总体结果</h6>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            计算时间: {formatTimestamp(activeTestResults.calculatedAt)}
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>总曝光数 / 总转化数</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {activeTestResults.totalExposures} / {activeTestResults.totalConversions}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            总体转化率: {(activeTestResults.overallConversionRate * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* 统计显著性 */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>统计显著性:</span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: activeTestResults.statisticalSignificance.isSignificant ? '#52c41a' : '#faad14',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                            }}
                          >
                            {activeTestResults.statisticalSignificance.isSignificant ? '显著' : '不显著'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            p值: {activeTestResults.statisticalSignificance.pValue.toFixed(4)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            效应大小: {activeTestResults.statisticalSignificance.effectSize.toFixed(4)}
                          </span>
                        </div>
                        
                        {activeTestResults.statisticalSignificance.confidenceInterval && (
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            置信区间: [{activeTestResults.statisticalSignificance.confidenceInterval.lower.toFixed(4)}, {activeTestResults.statisticalSignificance.confidenceInterval.upper.toFixed(4)}]
                          </div>
                        )}
                      </div>
                      
                      {/* 获胜者 */}
                      {activeTestResults.winner && (
                        <div style={{ 
                          padding: '1rem', 
                          backgroundColor: '#e6f7ff',
                          border: '1px solid #91d5ff',
                          borderRadius: '6px',
                          marginBottom: '1.5rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>🏆</span>
                            <div>
                              <h6 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>获胜变体</h6>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                变体 <strong>{activeTestResults.winner.variantId}</strong> 表现最佳，
                                提升 <strong>{(activeTestResults.winner.improvement * 100).toFixed(2)}%</strong>，
                                置信度 <strong>{(activeTestResults.winner.confidence * 100).toFixed(1)}%</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 变体结果 */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h6 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>变体性能</h6>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {activeTestResults.variantResults.map(result => (
                            <div 
                              key={result.variantId}
                              style={{
                                padding: '1rem',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                backgroundColor: '#fff',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <h6 style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
                                    {result.variantId}
                                    {activeTest.variants.find(v => v.variantId === result.variantId)?.isControl && (
                                      <span style={{ fontSize: '0.625rem', color: '#52c41a', marginLeft: '0.25rem' }}>
                                        (控制组)
                                      </span>
                                    )}
                                  </h6>
                                  {activeTestResults.winner?.variantId === result.variantId && (
                                    <span style={{ fontSize: '0.625rem', backgroundColor: '#52c41a', color: 'white', padding: '0.125rem 0.375rem', borderRadius: '10px' }}>
                                      获胜者
                                    </span>
                                  )}
                                </div>
                                
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '0.75rem', color: '#666' }}>曝光数 / 转化数</div>
                                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                    {result.exposures} / {result.conversions}
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#666' }}>转化率</span>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                                    {(result.conversionRate * 100).toFixed(2)}%
                                  </span>
                                </div>
                                {/* 转化率进度条 */}
                                <div style={{ height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
                                  <div 
                                    style={{ 
                                      height: '100%', 
                                      backgroundColor: '#1890ff',
                                      width: `${Math.min(100, result.conversionRate * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {result.relativeImprovement !== undefined && (
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                  <span>相对于控制组: </span>
                                  <span style={{ color: result.relativeImprovement > 0 ? '#52c41a' : '#ff4d4f' }}>
                                    {result.relativeImprovement > 0 ? '+' : ''}{(result.relativeImprovement * 100).toFixed(2)}%
                                  </span>
                                </div>
                              )}
                              
                              <div style={{ fontSize: '0.625rem', color: '#888', marginTop: '0.5rem' }}>
                                置信区间: [{result.confidenceInterval.lower.toFixed(4)}, {result.confidenceInterval.upper.toFixed(4)}]
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* 建议 */}
                      {activeTestResults.recommendations.length > 0 && (
                        <div>
                          <h6 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>建议</h6>
                          <ul style={{ fontSize: '0.75rem', color: '#666', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                            {activeTestResults.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (activeTest.status === 'active' || activeTest.status === 'completed') ? (
                  <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                    <p>正在加载测试结果...</p>
                    <button
                      onClick={() => loadTestResults(activeTest.testId)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '1rem',
                      }}
                    >
                      加载结果
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                    <p>测试尚未开始，无法显示结果。</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
                <p>请从左侧列表选择一个测试查看详情</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 关于A/B测试的解释 */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
          <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>关于A/B测试</h5>
          <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              A/B测试（也称为拆分测试）是一种比较两个或多个版本（变体）的方法，以确定哪个版本在特定指标上表现更好。
              在邮件营销中，您可以测试不同的主题行、内容、发件人、发送时间等。
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>关键概念：</strong>
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
              <li><strong>控制组：</strong>原始版本，用作比较基准</li>
              <li><strong>变体：</strong>要测试的替代版本</li>
              <li><strong>置信水平：</strong>结果可靠性的概率，通常设置为95%</li>
              <li><strong>统计显著性：</strong>结果不是偶然发生的可能性</li>
              <li><strong>效应大小：</strong>变体之间的实际差异大小</li>
            </ul>
            <p>
              当测试达到统计显著性时，可以确定获胜变体并将其应用到所有收件人。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}