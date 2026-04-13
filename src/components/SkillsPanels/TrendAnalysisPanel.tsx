'use client';

import { useState, useEffect } from 'react';

interface TimeSeriesDataPoint {
  intervalStart: string;
  intervalEnd: string;
  value: number;
  count: number;
  min: number;
  max: number;
  avg: number;
}

interface AggregatedTimeSeries {
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  dataPoints: TimeSeriesDataPoint[];
  metricType: string;
  aggregation: 'avg' | 'sum' | 'count' | 'min' | 'max';
}

interface TrendAnalysisResult {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number;
  slope: number;
  rSquared: number;
  forecast?: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  observations: string[];
}

interface TrendAnalysisPanelProps {
  onError?: (error: string) => void;
  onMessage?: (message: string) => void;
}

export default function TrendAnalysisPanel({ onError, onMessage }: TrendAnalysisPanelProps) {
  const [metricTypes, setMetricTypes] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [timeSeries, setTimeSeries] = useState<AggregatedTimeSeries | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30天前
    endDate: new Date().toISOString().split('T')[0], // 今天
  });
  const [interval, setInterval] = useState<'day' | 'hour' | 'week' | 'month'>('day');
  const [aggregation, setAggregation] = useState<'avg' | 'sum' | 'count' | 'min' | 'max'>('avg');
  const [analyzeTrend, setAnalyzeTrend] = useState(true);
  const [dataPointCount, setDataPointCount] = useState(0);
  
  useEffect(() => {
    async function loadMetricTypes() {
      setLoadingMetrics(true);
      try {
        const response = await fetch('/api/skills/trend-analysis');
        if (!response.ok) {
          throw new Error(`Failed to load metric types: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          setMetricTypes(data.metricTypes || []);
          setDataPointCount(data.dataPointCount || 0);
          
          // 如果有可用的指标类型，选择第一个
          if (data.metricTypes && data.metricTypes.length > 0) {
            setSelectedMetric(data.metricTypes[0]);
          }
        } else {
          throw new Error(data.message || 'Failed to load metric types');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to load metric types:', errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadMetricTypes();
  }, []);
  async function loadTimeSeries() {
    if (!selectedMetric) {
      onError?.('请选择指标类型');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        metricType: selectedMetric,
        startDate: dateRange.startDate + 'T00:00:00.000Z',
        endDate: dateRange.endDate + 'T23:59:59.999Z',
        interval,
        aggregation,
        analyzeTrend: analyzeTrend.toString(),
        fillMissing: 'true',
        fillValue: '0',
      });
      
      const response = await fetch(`/api/skills/trend-analysis?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to load time series: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setTimeSeries(data.timeSeries);
        setTrendAnalysis(data.trendAnalysis || null);
        onMessage?.(`已加载 ${data.timeSeries.dataPoints.length} 个数据点`);
      } else {
        throw new Error(data.message || 'Failed to load time series');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load time series:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  
  function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  function getDirectionColor(direction: string): string {
    switch (direction) {
      case 'increasing': return '#52c41a';
      case 'decreasing': return '#ff4d4f';
      case 'volatile': return '#faad14';
      case 'stable': return '#1890ff';
      default: return '#666';
    }
  }
  
  function getDirectionLabel(direction: string): string {
    switch (direction) {
      case 'increasing': return '上升';
      case 'decreasing': return '下降';
      case 'volatile': return '波动';
      case 'stable': return '平稳';
      default: return direction;
    }
  }
  
  function getIntervalLabel(interval: string): string {
    switch (interval) {
      case 'minute': return '分钟';
      case 'hour': return '小时';
      case 'day': return '天';
      case 'week': return '周';
      case 'month': return '月';
      default: return interval;
    }
  }
  
  function getAggregationLabel(aggregation: string): string {
    switch (aggregation) {
      case 'avg': return '平均值';
      case 'sum': return '总和';
      case 'count': return '计数';
      case 'min': return '最小值';
      case 'max': return '最大值';
      default: return aggregation;
    }
  }
  
  function getMetricLabel(metricType: string): string {
    // 将指标类型转换为更友好的名称
    const metricLabels: Record<string, string> = {
      'successRate': '成功率',
      'failureRate': '失败率',
      'executionTime': '执行时间',
      'errorCount': '错误计数',
      'cacheHitRate': '缓存命中率',
      'throughput': '吞吐量',
      'open-rate': '打开率',
      'click-rate': '点击率',
      'reply-rate': '回复率',
      'conversion': '转化率',
      'engagement': '互动率',
    };
    
    return metricLabels[metricType] || metricType;
  }
  
  // 计算图表的最大值
  function getChartMaxValue(): number {
    if (!timeSeries || timeSeries.dataPoints.length === 0) return 100;
    
    const maxValue = Math.max(...timeSeries.dataPoints.map(point => point.value));
    return maxValue * 1.1; // 增加10%的余量
  }
  
  // 导出数据为CSV
  function exportToCSV() {
    if (!timeSeries) return;
    
    const headers = ['时间间隔开始', '时间间隔结束', '值', '数据点数量', '最小值', '最大值', '平均值'];
    const rows = timeSeries.dataPoints.map(point => [
      point.intervalStart,
      point.intervalEnd,
      point.value.toString(),
      point.count.toString(),
      point.min.toString(),
      point.max.toString(),
      point.avg.toString(),
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trend_${selectedMetric}_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  // 渲染简单的趋势图（基于文本）
  function renderSimpleChart() {
    if (!timeSeries || timeSeries.dataPoints.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem' }}>没有数据可显示</div>;
    }
    
    const maxValue = getChartMaxValue();
    const chartHeight = 150;
    const chartWidth = 800;
    const pointCount = timeSeries.dataPoints.length;
    const pointWidth = Math.min(20, chartWidth / pointCount);
    
    // 只显示最多50个点
    const displayData = pointCount > 50 
      ? timeSeries.dataPoints.filter((_, index) => index % Math.ceil(pointCount / 50) === 0)
      : timeSeries.dataPoints;
    
    return (
      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <div style={{ 
          position: 'relative', 
          height: `${chartHeight}px`, 
          width: `${Math.max(chartWidth, displayData.length * pointWidth)}px`,
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '1rem',
        }}>
          {/* Y轴标签 */}
          <div style={{ position: 'absolute', left: '0.5rem', top: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
            {maxValue.toFixed(1)}
          </div>
          <div style={{ position: 'absolute', left: '0.5rem', bottom: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
            0
          </div>
          
          {/* 网格线 */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '3rem', 
            right: '1rem', 
            height: '1px', 
            backgroundColor: '#e0e0e0', 
            transform: 'translateY(-50%)' 
          }} />
          
          {/* 数据点 */}
          {displayData.map((point, index) => {
            const x = 3 + index * pointWidth;
            const height = (point.value / maxValue) * (chartHeight - 20);
            const y = chartHeight - 10 - height;
            
            return (
              <div key={index} style={{ position: 'absolute' }}>
                {/* 数据柱 */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${pointWidth - 2}px`,
                    height: `${height}px`,
                    backgroundColor: '#1890ff',
                    borderRadius: '2px 2px 0 0',
                    opacity: 0.7,
                  }}
                  title={`${formatDateTime(point.intervalStart)}: ${point.value.toFixed(2)}`}
                />
                
                {/* 数据点标签（每隔5个显示一个） */}
                {index % 5 === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${x}px`,
                      top: `${chartHeight - 5}px`,
                      width: `${pointWidth * 5}px`,
                      fontSize: '0.625rem',
                      color: '#666',
                      textAlign: 'center',
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'top left',
                    }}
                  >
                    {formatDate(point.intervalStart)}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* 趋势线（如果有趋势分析） */}
          {trendAnalysis && trendAnalysis.slope !== 0 && displayData.length >= 2 && (
            <div style={{ position: 'absolute', pointerEvents: 'none' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '3px',
                  top: `${chartHeight - 10 - (trendAnalysis.slope * displayData.length * pointWidth / maxValue) * (chartHeight - 20) / 2}px`,
                  width: `${displayData.length * pointWidth}px`,
                  height: '2px',
                  backgroundColor: '#ff4d4f',
                  opacity: 0.8,
                  transform: `rotate(${Math.atan(trendAnalysis.slope * displayData.length * pointWidth / (chartHeight - 20))}rad)`,
                  transformOrigin: 'left center',
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (loadingMetrics) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>加载指标类型中...</p>
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
              历史趋势分析面板
            </h3>
            <p style={{ color: '#666' }}>
              分析和可视化监控指标的历史趋势，识别模式和预测未来趋势。
            </p>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            总数据点: <strong>{dataPointCount}</strong>
          </div>
        </div>
        
        {/* 控制面板 */}
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f9f9f9', 
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          marginBottom: '2rem',
        }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>查询参数</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* 指标选择 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                指标类型
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                }}
              >
                <option value="">选择指标...</option>
                {metricTypes.map(metric => (
                  <option key={metric} value={metric}>
                    {getMetricLabel(metric)} ({metric})
                  </option>
                ))}
              </select>
            </div>
            
            {/* 时间间隔 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                时间间隔
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                }}
              >
                <option value="hour">小时</option>
                <option value="day">天</option>
                <option value="week">周</option>
                <option value="month">月</option>
              </select>
            </div>
            
            {/* 聚合函数 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                聚合函数
              </label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                }}
              >
                <option value="avg">平均值</option>
                <option value="sum">总和</option>
                <option value="count">计数</option>
                <option value="min">最小值</option>
                <option value="max">最大值</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* 开始日期 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                开始日期
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                }}
              />
            </div>
            
            {/* 结束日期 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                结束日期
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                }}
              />
            </div>
            
            {/* 趋势分析开关 */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={analyzeTrend}
                  onChange={(e) => setAnalyzeTrend(e.target.checked)}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <span style={{ fontSize: '0.875rem' }}>自动分析趋势</span>
              </label>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={loadTimeSeries}
              disabled={loading || !selectedMetric}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                minWidth: '150px',
              }}
            >
              {loading ? '加载中...' : '查询趋势数据'}
            </button>
            
            {timeSeries && (
              <button
                onClick={exportToCSV}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#52c41a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  minWidth: '150px',
                }}
              >
                导出CSV
              </button>
            )}
          </div>
        </div>
        
        {/* 结果展示 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>正在加载趋势数据...</p>
          </div>
        ) : timeSeries ? (
          <>
            {/* 摘要信息 */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                趋势分析结果: {getMetricLabel(selectedMetric)}
              </h4>
              
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
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>时间范围</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {formatDate(dateRange.startDate)} 至 {formatDate(dateRange.endDate)}
                  </div>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>数据点数量</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{timeSeries.dataPoints.length}</div>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>时间间隔</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{getIntervalLabel(timeSeries.interval)}</div>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fff7e6',
                  border: '1px solid #ffd591',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>聚合函数</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{getAggregationLabel(timeSeries.aggregation)}</div>
                </div>
              </div>
            </div>
            
            {/* 趋势分析结果 */}
            {trendAnalysis && (
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f9f9f9', 
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                marginBottom: '2rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h5 style={{ fontSize: '1rem', fontWeight: 'bold' }}>趋势分析</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: getDirectionColor(trendAnalysis.direction),
                        color: 'white',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                      }}
                    >
                      {getDirectionLabel(trendAnalysis.direction)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                      强度: {(trendAnalysis.strength * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>斜率</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{trendAnalysis.slope.toFixed(4)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>R²值</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{trendAnalysis.rSquared.toFixed(4)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>预测值</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                      {trendAnalysis.forecast ? trendAnalysis.forecast.toFixed(2) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {trendAnalysis.confidenceInterval && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>置信区间</div>
                    <div style={{ fontSize: '0.875rem' }}>
                      [{trendAnalysis.confidenceInterval.lower.toFixed(2)}, {trendAnalysis.confidenceInterval.upper.toFixed(2)}]
                    </div>
                  </div>
                )}
                
                {trendAnalysis.observations.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>观察点</div>
                    <ul style={{ fontSize: '0.875rem', color: '#666', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                      {trendAnalysis.observations.map((observation, index) => (
                        <li key={index}>{observation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* 趋势图表 */}
            <div style={{ marginBottom: '2rem' }}>
              <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>趋势图表</h5>
              {renderSimpleChart()}
            </div>
            
            {/* 数据表格 */}
            <div style={{ marginBottom: '2rem' }}>
              <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>原始数据</h5>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0', fontSize: '0.875rem' }}>时间间隔开始</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0', fontSize: '0.875rem' }}>时间间隔结束</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0', fontSize: '0.875rem' }}>值</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0', fontSize: '0.875rem' }}>数据点数量</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0', fontSize: '0.875rem' }}>最小值</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0', fontSize: '0.875form' }}>最大值</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0', fontSize: '0.875rem' }}>平均值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSeries.dataPoints.map((point, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{formatDateTime(point.intervalStart)}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{formatDateTime(point.intervalEnd)}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold' }}>{point.value.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{point.count}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{point.min.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{point.max.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{point.avg.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
            <p>选择指标并查询以查看趋势数据</p>
          </div>
        )}
        
        {/* 关于趋势分析的解释 */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
          <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>关于趋势分析</h5>
          <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              趋势分析帮助您理解监控指标随时间的变化模式。通过分析历史数据，您可以：
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
              <li><strong>识别模式：</strong>发现周期性变化、趋势方向（上升/下降）和异常点</li>
              <li><strong>预测未来：</strong>基于历史趋势预测未来值</li>
              <li><strong>评估干预效果：</strong>比较策略变更前后的性能变化</li>
              <li><strong>优化资源分配：</strong>根据趋势调整资源分配和优先级</li>
            </ul>
            <p>
              <strong>关键指标解释：</strong>
            </p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li><strong>斜率：</strong>趋势线的倾斜度，正值表示上升，负值表示下降</li>
              <li><strong>R²值：</strong>拟合优度，表示趋势线对数据的解释程度（0-1，越高越好）</li>
              <li><strong>置信区间：</strong>预测值的可能范围，表示预测的不确定性</li>
              <li><strong>统计显著性：</strong>趋势是否可能是随机波动（通常p值小于0.05表示显著）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}