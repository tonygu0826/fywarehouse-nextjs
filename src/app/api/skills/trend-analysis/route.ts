export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { historicalTrendAnalyzer } from '@/lib/historical-trend-analysis';
import { monitoringAlertSystem } from '@/lib/monitoring-alert-system';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const metricType = searchParams.get('metricType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const interval = searchParams.get('interval') as any || 'day';
    const aggregation = searchParams.get('aggregation') as any || 'avg';
    const resourceId = searchParams.get('resourceId');
    const resourceType = searchParams.get('resourceType');
    const analyzeTrend = searchParams.get('analyzeTrend') === 'true';
    const fillMissing = searchParams.get('fillMissing') === 'true';
    const fillValue = searchParams.get('fillValue');
    const exportFormat = searchParams.get('export');
    
    // 如果没有metricType，返回可用指标类型
    if (!metricType) {
      const metricTypes = historicalTrendAnalyzer.getAvailableMetricTypes();
      const dataPointCount = historicalTrendAnalyzer.getDataPointCount();
      
      return NextResponse.json({
        success: true,
        metricTypes,
        dataPointCount,
        endpoints: {
          POST: '/api/skills/trend-analysis - 记录数据点',
          GET: '/api/skills/trend-analysis?metricType=<type>&startDate=<date>&endDate=<date>&interval=<interval> - 查询时间序列',
        },
        note: '使用POST方法记录数据点，使用GET方法查询时间序列数据',
      });
    }
    
    // 验证必要参数
    if (!startDate || !endDate) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required parameters: startDate and endDate' 
        },
        { status: 400 }
      );
    }
    
    // 构建查询选项
    const queryOptions = {
      metricType,
      startDate,
      endDate,
      interval,
      aggregation,
      filters: [] as any[],
      fillMissing,
      fillValue: fillValue ? parseFloat(fillValue) : 0,
    };
    
    // 添加资源过滤器
    if (resourceId) {
      queryOptions.filters.push({
        field: 'resourceId',
        operator: 'eq' as const,
        value: resourceId,
      });
    }
    
    if (resourceType) {
      queryOptions.filters.push({
        field: 'resourceType',
        operator: 'eq' as const,
        value: resourceType,
      });
    }
    
    // 查询时间序列
    const timeSeries = historicalTrendAnalyzer.queryTimeSeries(queryOptions);
    
    // 分析趋势（如果需要）
    let trendAnalysis: any = null;
    if (analyzeTrend && timeSeries.dataPoints.length >= 2) {
      trendAnalysis = historicalTrendAnalyzer.analyzeTrend(timeSeries);
    }
    
    // 准备响应数据
    const responseData: any = {
      success: true,
      timeSeries,
      query: {
        metricType,
        startDate,
        endDate,
        interval,
        aggregation,
        resourceId,
        resourceType,
        dataPointCount: timeSeries.dataPoints.length,
      },
    };
    
    if (trendAnalysis) {
      responseData.trendAnalysis = trendAnalysis;
    }
    
    // 导出格式（如果需要）
    if (exportFormat === 'csv') {
      // 生成CSV
      const csvHeaders = ['intervalStart', 'intervalEnd', 'value', 'count', 'min', 'max', 'avg'];
      const csvRows = timeSeries.dataPoints.map(point => 
        csvHeaders.map(header => point[header as keyof typeof point]).join(',')
      );
      
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="trend_${metricType}_${startDate}_to_${endDate}.csv"`,
        },
      });
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[TrendAnalysis API] Error:', error);
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
    
    // 支持的动作：recordDataPoint, recordDataPoints, recordFromMonitoring, cleanup
    
    if (action === 'recordDataPoint') {
      const dataPoint = data.dataPoint;
      
      if (!dataPoint || !dataPoint.metricType || dataPoint.value === undefined) {
        return NextResponse.json(
          { success: false, message: 'Missing or invalid data point' },
          { status: 400 }
        );
      }
      
      historicalTrendAnalyzer.recordDataPoint(dataPoint);
      
      return NextResponse.json({
        success: true,
        message: 'Data point recorded',
      });
    }
    
    if (action === 'recordDataPoints') {
      const dataPoints = data.dataPoints;
      
      if (!dataPoints || !Array.isArray(dataPoints)) {
        return NextResponse.json(
          { success: false, message: 'Missing or invalid data points array' },
          { status: 400 }
        );
      }
      
      historicalTrendAnalyzer.recordDataPoints(dataPoints);
      
      return NextResponse.json({
        success: true,
        message: `${dataPoints.length} data points recorded`,
      });
    }
    
    if (action === 'recordFromMonitoring') {
      // 从监控系统导入数据
      const metricType = data.metricType;
      const startDate = data.startDate;
      const endDate = data.endDate;
      
      if (!metricType) {
        return NextResponse.json(
          { success: false, message: 'Missing metricType' },
          { status: 400 }
        );
      }
      
      // 从监控系统获取指标
      const metrics = monitoringAlertSystem.getMetrics({
        metricType,
        startDate,
        endDate,
      });
      
      // 转换为时间序列数据点
      const dataPoints = metrics.map(metric => ({
        metricType: metric.metricType,
        value: metric.value,
        timestamp: metric.timestamp,
        tags: metric.tags,
        resourceId: metric.resourceId,
        resourceType: metric.resourceType,
      }));
      
      // 记录数据点
      historicalTrendAnalyzer.recordDataPoints(dataPoints);
      
      return NextResponse.json({
        success: true,
        message: `Imported ${dataPoints.length} data points from monitoring system`,
        importedCount: dataPoints.length,
      });
    }
    
    if (action === 'cleanup') {
      const maxAgeDays = data.maxAgeDays || 90;
      
      historicalTrendAnalyzer.cleanupOldData(maxAgeDays);
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up data older than ${maxAgeDays} days`,
      });
    }
    
    // 默认动作：记录单个数据点
    if (body.metricType && body.value !== undefined) {
      historicalTrendAnalyzer.recordDataPoint(body);
      
      return NextResponse.json({
        success: true,
        message: 'Data point recorded (default action)',
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Invalid action. Supported actions: recordDataPoint, recordDataPoints, recordFromMonitoring, cleanup' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[TrendAnalysis API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}