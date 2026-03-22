import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

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
  | { ok: true; config: SMTPTransport.Options; from: string; to: string }
  | { ok: false; message: string; missing: string[] };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,20}$/;
const spamPattern = /(viagra|casino|crypto|bitcoin|loan|seo service|backlink|telegram|whatsapp.*invest)/i;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const MULTISPACE = /\s+/g;
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function cleanInline(value: string | undefined) {
  return (value ?? '').replace(CONTROL_CHARS, ' ').replace(MULTISPACE, ' ').trim();
}

function cleanMultiline(value: string | undefined) {
  return (value ?? '')
    .replace(CONTROL_CHARS, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizePayload(payload: ContactPayload): SanitizedContactPayload {
  return {
    firstName: cleanInline(payload.firstName),
    lastName: cleanInline(payload.lastName),
    email: cleanInline(payload.email).toLowerCase(),
    phone: cleanInline(payload.phone),
    serviceRequest: cleanMultiline(payload.serviceRequest),
  };
}

export function validatePayload(payload: SanitizedContactPayload) {
  if (!payload.firstName) return 'First Name is required.';
  if (!payload.lastName) return 'Last Name is required.';
  if (!payload.email) return 'Email Address is required.';
  if (!emailPattern.test(payload.email)) return 'Enter a valid email address.';
  if (!payload.phone) return 'Phone Number is required.';
  if (!phonePattern.test(payload.phone)) return 'Enter a valid phone number.';
  if (payload.firstName.length > 80 || payload.lastName.length > 80) return 'Name fields are too long.';
  if (payload.email.length > 160) return 'Email Address is too long.';
  if (payload.phone.length > 30) return 'Phone Number is too long.';
  if (payload.serviceRequest.length > 5000) return 'Service Request is too long.';
  return null;
}

export function isSpamLike(payload: SanitizedContactPayload) {
  const combined = [payload.firstName, payload.lastName, payload.email, payload.phone, payload.serviceRequest].join(' ');
  return spamPattern.test(combined);
}

export function getMailConfig(): MailConfigStatus {
  const host = process.env.EMAIL_SERVER_HOST?.trim();
  const port = process.env.EMAIL_SERVER_PORT?.trim();
  const user = process.env.EMAIL_SERVER_USER?.trim();
  const pass = process.env.EMAIL_SERVER_PASSWORD?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to = process.env.EMAIL_TO?.trim() || 'ops@fywarehouse.com';

  const missing = [
    ['EMAIL_SERVER_HOST', host],
    ['EMAIL_SERVER_PORT', port],
    ['EMAIL_SERVER_USER', user],
    ['EMAIL_SERVER_PASSWORD', pass],
    ['EMAIL_FROM', from],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name as string);

  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message:
        'Contact form is configured, but outbound email is not enabled yet. Add EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, and EMAIL_FROM to activate delivery.',
    };
  }

  return {
    ok: true,
    from: from as string,
    to,
    config: {
      host: host as string,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user: user as string,
        pass: pass as string,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    },
  };
}

export function createTransport() {
  const config = getMailConfig();
  if (!config.ok) {
    throw new Error(config.message);
  }

  return {
    transporter: nodemailer.createTransport(config.config),
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

  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function enforceRateLimit(key: string) {
  const now = Date.now();
  const recent = (rateLimitStore.get(key) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(key, recent);
    return {
      allowed: false as const,
      retryAfterSeconds: Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000)),
    };
  }

  recent.push(now);
  rateLimitStore.set(key, recent);
  return { allowed: true as const, retryAfterSeconds: 0 };
}

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }

  const configuredOrigin = process.env.ALLOWED_ORIGIN?.trim();
  if (configuredOrigin) {
    try {
      return new URL(origin).origin === new URL(configuredOrigin).origin;
    } catch {
      return false;
    }
  }

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function classifyMailError(error: unknown) {
  const candidate = error as NodeJS.ErrnoException & {
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
