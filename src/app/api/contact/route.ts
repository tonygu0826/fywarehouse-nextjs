import { NextResponse } from 'next/server';
import {
  assertTrustedOrigin,
  buildMessage,
  classifyMailError,
  createTransport,
  enforceRateLimit,
  getClientIp,
  getMailConfig,
  isSpamLike,
  logContactEvent,
  sanitizePayload,
  type ContactPayload,
  validatePayload,
} from '@/lib/contact-mail';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const clientIp = getClientIp(request);

  if (!assertTrustedOrigin(request)) {
    logContactEvent('blocked.origin', { clientIp });
    return NextResponse.json({ message: 'Invalid form origin.' }, { status: 403 });
  }

  const limit = enforceRateLimit(clientIp);
  if (!limit.allowed) {
    logContactEvent('blocked.rate_limit', { clientIp, retryAfterSeconds: limit.retryAfterSeconds });
    return NextResponse.json(
      { message: 'Too many submissions. Please wait a minute and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const rawPayload = (await request.json()) as ContactPayload;
    const payload = sanitizePayload(rawPayload);
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    if (isSpamLike(payload)) {
      logContactEvent('blocked.spam', { clientIp, email: payload.email });
      return NextResponse.json({ message: 'Unable to submit the contact form right now.' }, { status: 400 });
    }

    const mailConfig = getMailConfig();
    if (!mailConfig.ok) {
      logContactEvent('mail.unconfigured', { clientIp, missing: mailConfig.missing });
      return NextResponse.json({ message: mailConfig.message }, { status: 503 });
    }

    const { transporter, from, to } = createTransport();
    const message = buildMessage(payload);
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: payload.email,
      ...message,
    });

    const durationMs = Date.now() - startedAt;
    logContactEvent('mail.sent', {
      clientIp,
      durationMs,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      messageId: info.messageId,
    });

    return NextResponse.json({
      message: 'Thanks. Our Client Services team will contact you shortly.',
      submittedAt: new Date().toISOString(),
      durationMs,
      messageId: info.messageId ?? null,
      status: 'sent',
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const classified = classifyMailError(error);
    logContactEvent('mail.failed', {
      clientIp,
      durationMs,
      errorCode: classified.code,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ message: classified.userMessage }, { status: classified.status });
  }
}
