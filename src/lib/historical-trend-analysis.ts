/**
 * Historical Trend Analysis for FYMail
 * 
 * 历史趋势分析基础：监控数据的趋势查询/展示雏形。
 * 提供时间序列数据的聚合、分析和趋势检测功能。
 * 
 * 硬约束：不修改登录代码、登录流程、鉴权逻辑。
 */

export interface TimeSeriesDataPoint {
  /** 时间戳 */
  timestamp: string;
  /** 指标值 */
  value: number;
  /** 指标类型 */
  metricType: string;
  /** 标签 */
  tags: Record<string, string>;
  /** 资源ID */
  resourceId?: string;
  /** 资源类型 */
  resourceType?: string;
}

export interface AggregatedTimeSeries {
  /** 时间间隔 */
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  /** 数据点 */
  dataPoints: Array<{
    /** 间隔开始时间 */
    intervalStart: string;
    /** 间隔结束时间 */
    intervalEnd: string;
    /** 聚合值 */
    value: number;
    /** 数据点数量 */
    count: number;
    /** 最小值 */
    min: number;
    /** 最大值 */
    max: number;
    /** 平均值 */
    avg: number;
  }>;
  /** 指标类型 */
  metricType: string;
  /** 聚合函数 */
  aggregation: 'avg' | 'sum' | 'count' | 'min' | 'max';
}

export interface TrendAnalysisResult {
  /** 趋势方向 */
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  /** 趋势强度（0-1） */
  strength: number;
  /** 斜率 */
  slope: number;
  /** R²值（拟合优度） */
  rSquared: number;
  /** 预测值（下一个间隔） */
  forecast?: number;
  /** 置信区间 */
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  /** 关键观察点 */
  observations: string[];
}

export interface TrendQueryOptions {
  /** 指标类型 */
  metricType: string;
  /** 开始时间 */
  startDate: string;
  /** 结束时间 */
  endDate: string;
  /** 时间间隔 */
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  /** 聚合函数 */
  aggregation?: 'avg' | 'sum' | 'count' | 'min' | 'max';
  /** 过滤器 */
  filters?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt';
    value: any;
  }>;
  /** 分组字段 */
  groupBy?: string[];
  /** 是否填充缺失值 */
  fillMissing?: boolean;
  /** 填充值 */
  fillValue?: number;
}

/**
 * 历史趋势分析器
 */
export class HistoricalTrendAnalyzer {
  private dataStore: TimeSeriesDataPoint[] = [];
  private maxDataPoints: number = 100000;
  
  /**
   * 记录时间序列数据点
   */
  recordDataPoint(dataPoint: Omit<TimeSeriesDataPoint, 'timestamp'>): void {
    const pointWithTimestamp: TimeSeriesDataPoint = {
      ...dataPoint,
      timestamp: new Date().toISOString(),
    };
    
    this.dataStore.unshift(pointWithTimestamp);
    
    // 限制数据点数量
    if (this.dataStore.length > this.maxDataPoints) {
      this.dataStore = this.dataStore.slice(0, this.maxDataPoints);
    }
  }
  
  /**
   * 批量记录数据点
   */
  recordDataPoints(dataPoints: Omit<TimeSeriesDataPoint, 'timestamp'>[]): void {
    const now = new Date().toISOString();
    
    dataPoints.forEach(dataPoint => {
      this.dataStore.unshift({
        ...dataPoint,
        timestamp: now,
      });
    });
    
    // 限制数据点数量
    if (this.dataStore.length > this.maxDataPoints) {
      this.dataStore = this.dataStore.slice(0, this.maxDataPoints);
    }
  }
  
  /**
   * 查询时间序列数据
   */
  queryTimeSeries(options: TrendQueryOptions): AggregatedTimeSeries {
    const {
      metricType,
      startDate,
      endDate,
      interval,
      aggregation = 'avg',
      filters = [],
      groupBy = [],
      fillMissing = false,
      fillValue = 0,
    } = options;
    
    // 过滤数据点
    let filteredData = this.dataStore.filter(point => {
      // 指标类型匹配
      if (point.metricType !== metricType) return false;
      
      // 时间范围匹配
      const pointTime = new Date(point.timestamp);
      const startTime = new Date(startDate);
      const endTime = new Date(endDate);
      
      if (pointTime < startTime || pointTime > endTime) return false;
      
      // 应用过滤器
      for (const filter of filters) {
        let fieldValue: any;
        
        switch (filter.field) {
          case 'metricType':
            fieldValue = point.metricType;
            break;
          case 'resourceId':
            fieldValue = point.resourceId;
            break;
          case 'resourceType':
            fieldValue = point.resourceType;
            break;
          default:
            fieldValue = point.tags[filter.field];
            break;
        }
        
        if (!this.evaluateFilter(fieldValue, filter.operator, filter.value)) {
          return false;
        }
      }
      
      return true;
    });
    
    // 按时间间隔和分组进行聚合
    const aggregatedResult = this.aggregateDataPoints(
      filteredData,
      interval,
      aggregation,
      groupBy
    );
    
    // 填充缺失值
    if (fillMissing && aggregatedResult.dataPoints.length > 0) {
      this.fillMissingIntervals(aggregatedResult, startDate, endDate, interval, fillValue);
    }
    
    return aggregatedResult;
  }
  
  /**
   * 聚合数据点
   */
  private aggregateDataPoints(
    dataPoints: TimeSeriesDataPoint[],
    interval: string,
    aggregation: 'avg' | 'sum' | 'count' | 'min' | 'max',
    groupBy: string[]
  ): AggregatedTimeSeries {
    // 按间隔和分组键分组数据点
    const groupedData = new Map<string, TimeSeriesDataPoint[]>();
    
    dataPoints.forEach(point => {
      const intervalKey = this.getIntervalKey(point.timestamp, interval);
      let groupKey = intervalKey;
      
      // 添加分组字段
      if (groupBy.length > 0) {
        const groupValues = groupBy.map(field => {
          switch (field) {
            case 'resourceId':
              return point.resourceId || 'unknown';
            case 'resourceType':
              return point.resourceType || 'unknown';
            default:
              return point.tags[field] || 'unknown';
          }
        });
        
        groupKey = `${intervalKey}|${groupValues.join('|')}`;
      }
      
      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, []);
      }
      
      groupedData.get(groupKey)!.push(point);
    });
    
    // 对每个组进行聚合
    const dataPointsAggregated: AggregatedTimeSeries['dataPoints'] = [];
    
    for (const [groupKey, points] of groupedData.entries()) {
      const values = points.map(p => p.value);
      const intervalStart = this.getIntervalStart(groupKey.split('|')[0], interval);
      const intervalEnd = this.getIntervalEnd(intervalStart, interval);
      
      let aggregatedValue: number;
      
      switch (aggregation) {
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'avg':
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
      }
      
      dataPointsAggregated.push({
        intervalStart,
        intervalEnd,
        value: aggregatedValue,
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      });
    }
    
    // 按时间排序
    dataPointsAggregated.sort((a, b) => {
      return new Date(a.intervalStart).getTime() - new Date(b.intervalStart).getTime();
    });
    
    return {
      interval: interval as any,
      dataPoints: dataPointsAggregated,
      metricType: dataPoints.length > 0 ? dataPoints[0].metricType : 'unknown',
      aggregation,
    };
  }
  
  /**
   * 获取时间间隔键
   */
  private getIntervalKey(timestamp: string, interval: string): string {
    const date = new Date(timestamp);
    
    switch (interval) {
      case 'minute':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      case 'hour':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}`;
      case 'day':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      case 'week':
        // 获取一年中的第几周
        const weekNumber = this.getWeekNumber(date);
        return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }
  
  /**
   * 获取周数
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  /**
   * 获取间隔开始时间
   */
  private getIntervalStart(intervalKey: string, interval: string): string {
    switch (interval) {
      case 'minute':
        return `${intervalKey}:00.000Z`;
      case 'hour':
        return `${intervalKey}:00:00.000Z`;
      case 'day':
        return `${intervalKey}T00:00:00.000Z`;
      case 'week':
        // 简化：返回周的第一天（星期一）
        const [year, week] = intervalKey.split('-W');
        const weekNum = parseInt(week);
        const firstDayOfYear = new Date(parseInt(year), 0, 1);
        const firstMonday = new Date(firstDayOfYear);
        const dayOfWeek = firstMonday.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        firstMonday.setDate(firstMonday.getDate() - diff);
        firstMonday.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
        return firstMonday.toISOString();
      case 'month':
        return `${intervalKey}-01T00:00:00.000Z`;
      default:
        return intervalKey;
    }
  }
  
  /**
   * 获取间隔结束时间
   */
  private getIntervalEnd(intervalStart: string, interval: string): string {
    const startDate = new Date(intervalStart);
    const endDate = new Date(startDate);
    
    switch (interval) {
      case 'minute':
        endDate.setMinutes(endDate.getMinutes() + 1);
        break;
      case 'hour':
        endDate.setHours(endDate.getHours() + 1);
        break;
      case 'day':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'week':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }
    
    return endDate.toISOString();
  }
  
  /**
   * 填充缺失的间隔
   */
  private fillMissingIntervals(
    aggregatedSeries: AggregatedTimeSeries,
    startDate: string,
    endDate: string,
    interval: string,
    fillValue: number
  ): void {
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);
    
    // 计算总间隔数
    let totalIntervals = 0;
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      totalIntervals++;
      switch (interval) {
        case 'minute':
          currentTime.setMinutes(currentTime.getMinutes() + 1);
          break;
        case 'hour':
          currentTime.setHours(currentTime.getHours() + 1);
          break;
        case 'day':
          currentTime.setDate(currentTime.getDate() + 1);
          break;
        case 'week':
          currentTime.setDate(currentTime.getDate() + 7);
          break;
        case 'month':
          currentTime.setMonth(currentTime.getMonth() + 1);
          break;
      }
    }
    
    // 重建数据点数组，填充缺失的间隔
    const filledDataPoints: AggregatedTimeSeries['dataPoints'] = [];
    currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const intervalStart = currentTime.toISOString();
      const intervalEnd = this.getIntervalEnd(intervalStart, interval);
      const intervalKey = this.getIntervalKey(intervalStart, interval);
      
      // 查找现有数据点
      const existingPoint = aggregatedSeries.dataPoints.find(point => 
        this.getIntervalKey(point.intervalStart, interval) === intervalKey
      );
      
      if (existingPoint) {
        filledDataPoints.push(existingPoint);
      } else {
        // 创建填充的数据点
        filledDataPoints.push({
          intervalStart,
          intervalEnd,
          value: fillValue,
          count: 0,
          min: fillValue,
          max: fillValue,
          avg: fillValue,
        });
      }
      
      // 前进到下一个间隔
      switch (interval) {
        case 'minute':
          currentTime.setMinutes(currentTime.getMinutes() + 1);
          break;
        case 'hour':
          currentTime.setHours(currentTime.getHours() + 1);
          break;
        case 'day':
          currentTime.setDate(currentTime.getDate() + 1);
          break;
        case 'week':
          currentTime.setDate(currentTime.getDate() + 7);
          break;
        case 'month':
          currentTime.setMonth(currentTime.getMonth() + 1);
          break;
      }
    }
    
    aggregatedSeries.dataPoints = filledDataPoints;
  }
  
  /**
   * 评估过滤器
   */
  private evaluateFilter(fieldValue: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case 'eq':
        return fieldValue === filterValue;
      case 'neq':
        return fieldValue !== filterValue;
      case 'contains':
        return String(fieldValue).includes(String(filterValue));
      case 'gt':
        return Number(fieldValue) > Number(filterValue);
      case 'lt':
        return Number(fieldValue) < Number(filterValue);
      default:
        return true;
    }
  }
  
  /**
   * 分析趋势
   */
  analyzeTrend(aggregatedSeries: AggregatedTimeSeries): TrendAnalysisResult {
    const dataPoints = aggregatedSeries.dataPoints;
    
    if (dataPoints.length < 2) {
      return {
        direction: 'stable',
        strength: 0,
        slope: 0,
        rSquared: 0,
        observations: ['数据点不足，无法分析趋势'],
      };
    }
    
    // 提取数值和时间
    const values = dataPoints.map(point => point.value);
    const times = dataPoints.map((point, index) => index); // 使用索引作为时间
    
    // 计算线性回归
    const regression = this.calculateLinearRegression(times, values);
    
    // 判断趋势方向
    let direction: TrendAnalysisResult['direction'];
    if (Math.abs(regression.slope) < 0.01) {
      direction = 'stable';
    } else if (regression.slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }
    
    // 计算趋势强度（基于R²和斜率）
    const strength = Math.min(1, Math.abs(regression.slope) * 10 + regression.rSquared * 0.5);
    
    // 检测波动性
    const volatility = this.calculateVolatility(values);
    if (volatility > 0.2 && strength < 0.3) {
      direction = 'volatile';
    }
    
    // 生成观察点
    const observations = this.generateObservations(values, direction, strength, volatility);
    
    // 预测下一个值
    const forecast = regression.slope * times.length + regression.intercept;
    
    return {
      direction,
      strength,
      slope: regression.slope,
      rSquared: regression.rSquared,
      forecast,
      confidenceInterval: {
        lower: forecast * 0.9,
        upper: forecast * 1.1,
      },
      observations,
    };
  }
  
  /**
   * 计算线性回归
   */
  private calculateLinearRegression(x: number[], y: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const n = x.length;
    
    // 计算均值
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    
    // 计算协方差和方差
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += (x[i] - xMean) ** 2;
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // 计算R²
    let ssTotal = 0;
    let ssResidual = 0;
    
    for (let i = 0; i < n; i++) {
      const yPred = slope * x[i] + intercept;
      ssTotal += (y[i] - yMean) ** 2;
      ssResidual += (y[i] - yPred) ** 2;
    }
    
    const rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, rSquared };
  }
  
  /**
   * 计算波动性
   */
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // 相对波动性（标准差除以均值）
    return mean === 0 ? stdDev : stdDev / mean;
  }
  
  /**
   * 生成观察点
   */
  private generateObservations(
    values: number[],
    direction: string,
    strength: number,
    volatility: number
  ): string[] {
    const observations: string[] = [];
    const lastValue = values[values.length - 1];
    const firstValue = values[0];
    const change = lastValue - firstValue;
    const changePercent = firstValue === 0 ? 0 : (change / firstValue) * 100;
    
    // 趋势描述
    if (direction === 'increasing') {
      observations.push(`趋势向上，总体增长${changePercent.toFixed(1)}%`);
    } else if (direction === 'decreasing') {
      observations.push(`趋势向下，总体下降${Math.abs(changePercent).toFixed(1)}%`);
    } else if (direction === 'volatile') {
      observations.push(`波动较大，无明显趋势`);
    } else {
      observations.push(`趋势平稳，变化较小`);
    }
    
    // 强度描述
    if (strength > 0.7) {
      observations.push(`趋势强度高，趋势明显`);
    } else if (strength > 0.4) {
      observations.push(`趋势强度中等`);
    } else {
      observations.push(`趋势强度弱，趋势不明显`);
    }
    
    // 波动性描述
    if (volatility > 0.3) {
      observations.push(`波动性高，数据不稳定`);
    } else if (volatility > 0.15) {
      observations.push(`波动性中等`);
    } else {
      observations.push(`波动性低，数据稳定`);
    }
    
    // 极值检测
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const maxIndex = values.indexOf(maxValue);
    const minIndex = values.indexOf(minValue);
    
    if (maxValue > lastValue * 1.5) {
      observations.push(`在第${maxIndex + 1}个间隔出现峰值`);
    }
    
    if (minValue < lastValue * 0.5) {
      observations.push(`在第${minIndex + 1}个间隔出现谷值`);
    }
    
    return observations;
  }
  
  /**
   * 获取所有可用的指标类型
   */
  getAvailableMetricTypes(): string[] {
    const metricTypes = new Set<string>();
    
    this.dataStore.forEach(point => {
      metricTypes.add(point.metricType);
    });
    
    return Array.from(metricTypes);
  }
  
  /**
   * 获取数据点数量
   */
  getDataPointCount(): number {
    return this.dataStore.length;
  }
  
  /**
   * 清除旧数据
   */
  cleanupOldData(maxAgeDays: number = 90): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);
    
    this.dataStore = this.dataStore.filter(point => {
      return new Date(point.timestamp) >= cutoff;
    });
    
    console.log(`[HistoricalTrendAnalyzer] Cleaned up data older than ${maxAgeDays} days, remaining: ${this.dataStore.length} points`);
  }
}

// 默认导出单例
export const historicalTrendAnalyzer = new HistoricalTrendAnalyzer();