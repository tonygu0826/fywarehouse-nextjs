import { NextResponse } from 'next/server';
import { buildMessage, classifyMailError, createTransport, getMailConfig, logContactEvent } from '@/lib/contact-mail';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Test email endpoint is disabled in production.' }, { status: 403 });
  }

  const mailConfig = getMailConfig();
  if (!mailConfig.ok) {
    return NextResponse.json({ message: mailConfig.message }, { status: 503 });
  }

  try {
    const { transporter, from, to } = createTransport();
    const payload = {
      firstName: 'SMTP',
      lastName: 'Verifier',
      email: typeof mailConfig.config.auth === 'object' && mailConfig.config.auth && 'user' in mailConfig.config.auth
        ? String(mailConfig.config.auth.user)
        : from,
      phone: '0000000000',
      serviceRequest: 'This is a development-only SMTP configuration test.',
    };
    const message = buildMessage(payload);
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: payload.email,
      ...message,
      subject: `[TEST] ${message.subject}`,
    });

    logContactEvent('mail.test_sent', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return NextResponse.json({
      message: 'Test email sent successfully.',
      messageId: info.messageId ?? null,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const classified = classifyMailError(error);
    logContactEvent('mail.test_failed', {
      errorCode: classified.code,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ message: classified.userMessage }, { status: classified.status });
  }
}
