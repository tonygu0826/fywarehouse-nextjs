/**
 * 邮件服务客户端
 * 
 * 用于调用独立邮件发送服务的客户端模块。
 * 在Edge Runtime环境中，通过HTTP API调用外部邮件服务。
 * 在Node.js开发环境中，也可以配置为直接调用外部服务或使用模拟发送。
 */

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3003';
const EMAIL_SERVICE_API_KEY = process.env.EMAIL_SERVICE_API_KEY || 'fymail-secret-key-20240324';

export interface EmailSendOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  accepted: string[];
  rejected: string[];
  response?: string;
  error?: string;
  errorType?: string;
}

export interface BatchRecipient {
  email: string;
  variables?: Record<string, string>;
}

export interface BatchSendOptions {
  templateId?: string;
  templateName?: string;
  subject: string;
  html?: string;
  text?: string;
  recipients: BatchRecipient[];
  commonVariables?: Record<string, string>;
}

export interface BatchSendResult {
  success: boolean;
  jobId: string;
  total: number;
  sent: number;
  failed: number;
  details: Array<{
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  startedAt: string;
  completedAt: string;
  duration: number;
  error?: string;
}

/**
 * 发送单封邮件
 */
export async function sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  try {
    // 检查是否在Edge Runtime环境（应该总是使用外部服务）
    const isEdgeRuntime = typeof process !== 'undefined' && 
      (process.env.CF_PAGES === '1' || process.env.NEXT_RUNTIME === 'edge');
    
    // 如果是开发环境且没有配置邮件服务URL，使用模拟发送
    if (!isEdgeRuntime && process.env.NODE_ENV === 'development' && !EMAIL_SERVICE_URL) {
      console.warn('[Email Service] 开发环境未配置EMAIL_SERVICE_URL，使用模拟发送');
      return mockSendEmail(options);
    }
    
    const response = await fetch(`${EMAIL_SERVICE_URL}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_SERVICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Email Service] 邮件发送失败:', data);
      return {
        success: false,
        accepted: [],
        rejected: Array.isArray(options.to) ? options.to : [options.to],
        error: data.error || '邮件发送失败',
        errorType: data.errorType,
      };
    }
    
    return {
      success: true,
      messageId: data.messageId,
      accepted: data.accepted || [],
      rejected: data.rejected || [],
      response: data.response,
    };
  } catch (error) {
    console.error('[Email Service] 邮件服务调用失败:', error);
    return {
      success: false,
      accepted: [],
      rejected: Array.isArray(options.to) ? options.to : [options.to],
      error: error instanceof Error ? error.message : '邮件服务调用失败',
      errorType: 'SERVICE_CONNECTION_ERROR',
    };
  }
}

/**
 * 批量发送邮件
 */
export async function sendBatchEmail(options: BatchSendOptions): Promise<BatchSendResult> {
  try {
    // 检查是否在Edge Runtime环境
    const isEdgeRuntime = typeof process !== 'undefined' && 
      (process.env.CF_PAGES === '1' || process.env.NEXT_RUNTIME === 'edge');
    
    // 如果是开发环境且没有配置邮件服务URL，使用模拟发送
    if (!isEdgeRuntime && process.env.NODE_ENV === 'development' && !EMAIL_SERVICE_URL) {
      console.warn('[Email Service] 开发环境未配置EMAIL_SERVICE_URL，使用模拟批量发送');
      return mockSendBatchEmail(options);
    }
    
    const response = await fetch(`${EMAIL_SERVICE_URL}/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_SERVICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Email Service] 批量邮件发送失败:', data);
      return {
        success: false,
        jobId: `error-${Date.now()}`,
        total: options.recipients.length,
        sent: 0,
        failed: options.recipients.length,
        details: options.recipients.map(recipient => ({
          email: recipient.email,
          success: false,
          error: data.error || '批量发送失败',
        })),
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: 0,
        error: data.error,
      };
    }
    
    return data;
  } catch (error) {
    console.error('[Email Service] 批量邮件服务调用失败:', error);
    return {
      success: false,
      jobId: `error-${Date.now()}`,
      total: options.recipients.length,
      sent: 0,
      failed: options.recipients.length,
      details: options.recipients.map(recipient => ({
        email: recipient.email,
        success: false,
        error: error instanceof Error ? error.message : '批量邮件服务调用失败',
      })),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      duration: 0,
      error: error instanceof Error ? error.message : '批量邮件服务调用失败',
    };
  }
}

/**
 * 验证邮件服务连接
 */
export async function verifyEmailService(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  config?: {
    host: string;
    port: number;
    user: string;
    from: string;
  };
}> {
  try {
    const response = await fetch(`${EMAIL_SERVICE_URL}/health`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || '邮件服务不可用',
      };
    }
    
    return {
      success: true,
      message: '邮件服务连接正常',
      config: data.smtp,
    };
  } catch (error) {
    console.error('[Email Service] 健康检查失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '邮件服务连接失败',
    };
  }
}

/**
 * 模拟发送邮件（用于开发环境）
 */
async function mockSendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  console.info('[Mock Email Service] 模拟发送邮件:', {
    to: options.to,
    subject: options.subject,
    timestamp: new Date().toISOString(),
  });
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    accepted: Array.isArray(options.to) ? options.to : [options.to],
    rejected: [],
    response: '250 Mock email accepted for delivery',
  };
}

/**
 * 模拟批量发送邮件（用于开发环境）
 */
async function mockSendBatchEmail(options: BatchSendOptions): Promise<BatchSendResult> {
  console.info('[Mock Email Service] 模拟批量发送:', {
    recipients: options.recipients.length,
    subject: options.subject,
    timestamp: new Date().toISOString(),
  });
  
  const jobId = `mock-batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startedAt = new Date().toISOString();
  
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const details = options.recipients.map((recipient, index) => {
    // 模拟10%的失败率
    const shouldFail = Math.random() < 0.1;
    
    if (shouldFail) {
      return {
        email: recipient.email,
        success: false,
        error: '模拟发送失败',
      };
    }
    
    return {
      email: recipient.email,
      success: true,
      messageId: `mock-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    };
  });
  
  const sent = details.filter(d => d.success).length;
  const failed = details.filter(d => !d.success).length;
  
  return {
    success: true,
    jobId,
    total: options.recipients.length,
    sent,
    failed,
    details,
    startedAt,
    completedAt: new Date().toISOString(),
    duration: Date.now() - new Date(startedAt).getTime(),
  };
}