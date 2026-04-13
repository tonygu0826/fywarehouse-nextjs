/**
 * 联系邮件模块 - 适配器层
 * 
 * 此模块将原有的nodemailer依赖替换为邮件服务客户端调用，
 * 以支持Cloudflare Edge Runtime环境。
 */

import { sendEmail, verifyEmailService, type EmailSendOptions } from './email-service-client';

export type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  serviceRequest?: string;
  recaptcha?: string;
};

export type SanitizedContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceRequest: string;
};

export type MailConfigStatus =
  | { ok: true; config: any; from: string; to: string }
  | { ok: false; message: string; missing: string[] };

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^[+()\-\s\d]{7,20}$/;
const spamPattern = /(viagra|casino|crypto|bitcoin|loan|seo service|backlink|telegram|whatsapp.*invest)/i;

/**
 * Parse a comma-separated list of email addresses, trim whitespace,
 * filter out empty entries, and validate each email format.
 * Returns a comma-separated string of valid email addresses.
 */
function parseRecipientList(to: string): string {
  if (!to) return 'ops@fywarehouse.com';
  
  const emails = to
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
  if (emails.length === 0) return 'ops@fywarehouse.com';
  
  // Validate each email (basic format check)
  const validEmails = emails.filter(email => emailPattern.test(email));
  
  if (validEmails.length === 0) {
    console.warn('No valid email addresses found in EMAIL_TO, using default');
    return 'ops@fywarehouse.com';
  }
  
  return validEmails.join(', ');
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function cleanInline(value: string | undefined) {
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' ').substring(0, 100);
}

export function cleanMultiline(value: string | undefined) {
  if (!value) return '';
  return value.trim().substring(0, 5000);
}

export function sanitizePayload(payload: ContactPayload): SanitizedContactPayload {
  return {
    firstName: cleanInline(payload.firstName) || '(not provided)',
    lastName: cleanInline(payload.lastName) || '(not provided)',
    email: cleanInline(payload.email) || '(not provided)',
    phone: cleanInline(payload.phone) || '(not provided)',
    serviceRequest: cleanMultiline(payload.serviceRequest) || '(no message provided)',
  };
}

export function validatePayload(payload: SanitizedContactPayload) {
  const errors: string[] = [];
  
  if (!emailPattern.test(payload.email)) {
    errors.push('Invalid email address');
  }
  
  if (!payload.firstName || payload.firstName === '(not provided)') {
    errors.push('First name is required');
  }
  
  if (!payload.lastName || payload.lastName === '(not provided)') {
    errors.push('Last name is required');
  }
  
  if (payload.serviceRequest.length > 5000) {
    errors.push('Message is too long (max 5000 characters)');
  }
  
  return errors;
}

export function isSpamLike(payload: SanitizedContactPayload) {
  const combinedText = `${payload.firstName} ${payload.lastName} ${payload.email} ${payload.serviceRequest}`.toLowerCase();
  return spamPattern.test(combinedText);
}

export function getMailConfig(): MailConfigStatus {
  const required = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM',
    'EMAIL_TO',
  ] as const;
  
  const missing = required.filter(key => !process.env[key]?.trim());
  
  if (missing.length > 0) {
    return {
      ok: false,
      message: `Missing required email configuration: ${missing.join(', ')}`,
      missing,
    };
  }
  
  const host = process.env.EMAIL_SERVER_HOST!.trim();
  const port = parseInt(process.env.EMAIL_SERVER_PORT!.trim(), 10);
  const user = process.env.EMAIL_SERVER_USER!.trim();
  const pass = process.env.EMAIL_SERVER_PASSWORD!.trim();
  const secure = process.env.EMAIL_SERVER_SECURE === 'true';
  const from = process.env.EMAIL_FROM!.trim();
  const to = parseRecipientList(process.env.EMAIL_TO!);
  
  return {
    ok: true,
    config: {
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    },
    from,
    to,
  };
}

/**
 * 创建邮件传输器（兼容性接口）
 * 
 * 注意：此函数现在返回一个适配器对象，用于保持现有代码兼容性。
 * 实际邮件发送通过外部邮件服务完成。
 */
export function createTransport() {
  const config = getMailConfig();
  if (!config.ok) {
    throw new Error(config.message);
  }
  
  console.info('[Contact Mail] Using email service client for mail delivery');
  
  // 返回适配器对象，保持现有API兼容性
  return {
    transporter: {
      sendMail: async (mailOptions: any) => {
        try {
          const emailOptions: EmailSendOptions = {
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text,
            cc: mailOptions.cc,
            bcc: mailOptions.bcc,
            replyTo: mailOptions.replyTo,
            headers: mailOptions.headers,
          };
          
          const result = await sendEmail(emailOptions);
          
          if (!result.success) {
            throw new Error(result.error || '邮件发送失败');
          }
          
          return {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
            response: result.response,
          };
        } catch (error) {
          console.error('[Contact Mail] Email service call failed:', error);
          throw error;
        }
      },
      verify: async () => {
        try {
          const result = await verifyEmailService();
          if (!result.success) {
            throw new Error(result.error || '邮件服务验证失败');
          }
          return true;
        } catch (error) {
          console.error('[Contact Mail] Email service verification failed:', error);
          throw error;
        }
      },
    },
    from: config.from,
    to: config.to,
  };
}

export function buildMessage(payload: SanitizedContactPayload) {
  const serviceRequest = payload.serviceRequest || '(no message provided)';

  return {
    subject: `FYWarehouse contact form: ${payload.firstName} ${payload.lastName}`,
    text: [
      `First Name: ${payload.firstName}`,
      `Last Name: ${payload.lastName}`,
      `Email Address: ${payload.email}`,
      `Phone Number: ${payload.phone}`,
      '',
      'Service Request:',
      serviceRequest,
    ].join('\n'),
    html: `
        <p><strong>First Name:</strong> ${escapeHtml(payload.firstName)}</p>
        <p><strong>Last Name:</strong> ${escapeHtml(payload.lastName)}</p>
        <p><strong>Email Address:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Phone Number:</strong> ${escapeHtml(payload.phone)}</p>
        <p><strong>Service Request:</strong></p>
        <p>${escapeHtml(serviceRequest).replace(/\n/g, '<br />')}</p>
      `,
  };
}

export async function verifyMailTransport() {
  const { transporter } = createTransport();
  await transporter.verify();
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(key: string) {
  const now = Date.now();
  const windowMs = parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || '60000', 10);
  const max = parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '3', 10);
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt <= now) {
    // New window or expired window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  
  if (entry.count >= max) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  entry.count++;
  rateLimitStore.set(key, entry);
}

export function assertTrustedOrigin(request: Request) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
  const origin = request.headers.get('origin');
  
  if (origin && origin !== allowedOrigin) {
    console.warn(`Rejected request from untrusted origin: ${origin}`);
    throw new Error('Untrusted origin');
  }
}

export function classifyMailError(error: unknown) {
  const candidate = error as Error & {
    code?: string;
    responseCode?: number;
    command?: string;
  };

  const code = candidate?.code || 'UNKNOWN';
  const responseCode = candidate?.responseCode;

  if (code === 'EAUTH' || responseCode === 535) {
    return { status: 502, userMessage: 'Email delivery is temporarily unavailable due to a mail authentication issue.', code: 'SMTP_AUTH' };
  }

  if (code === 'ECONNECTION' || code === 'ESOCKET' || code === 'ETIMEDOUT' || code === 'EDNS') {
    return { status: 504, userMessage: 'Email delivery timed out while contacting the mail server. Please try again shortly.', code: 'SMTP_CONNECTION' };
  }

  if (typeof responseCode === 'number' && responseCode >= 500) {
    return { status: 502, userMessage: 'The mail server rejected the message. Please try again shortly.', code: 'SMTP_REJECTED' };
  }

  return { status: 500, userMessage: 'Unable to submit the contact form right now.', code: 'CONTACT_SEND_FAILED' };
}

export function logContactEvent(event: string, data: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: 'contact-mail',
      event,
      timestamp: new Date().toISOString(),
      ...data,
    }),
  );
}