import { NextResponse } from 'next/server';
import { classifyMailError, getMailConfig, logContactEvent, verifyMailTransport } from '@/lib/contact-mail';

export async function GET() {
  const mailConfig = getMailConfig();

  if (!mailConfig.ok) {
    return NextResponse.json(
      {
        status: 'degraded',
        mailConfigured: false,
        missing: mailConfig.missing,
        message: mailConfig.message,
      },
      { status: 503 },
    );
  }

  try {
    await verifyMailTransport();
    return NextResponse.json({
      status: 'ok',
      mailConfigured: true,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const classified = classifyMailError(error);
    logContactEvent('mail.health_failed', {
      errorCode: classified.code,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        status: 'degraded',
        mailConfigured: true,
        message: classified.userMessage,
        checkedAt: new Date().toISOString(),
      },
      { status: classified.status },
    );
  }
}
