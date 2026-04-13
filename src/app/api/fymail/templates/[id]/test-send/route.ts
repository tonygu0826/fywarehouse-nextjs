import { NextResponse } from 'next/server';
import { classifyMailError, logContactEvent } from '@/lib/contact-mail';
import { sendTemplateTestEmail, type TemplateTestSendInput } from '@/lib/fymail';

export const runtime = 'edge';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const payload = (await request.json()) as TemplateTestSendInput;
    const result = await sendTemplateTestEmail(params.id, payload);
    logContactEvent('fymail.template_test_sent', {
      templateId: result.templateId,
      to: result.to,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send test email.';
    if (message === 'Template not found.') {
      return NextResponse.json({ message }, { status: 404 });
    }
    if (message === 'Contact not found.') {
      return NextResponse.json({ message }, { status: 404 });
    }
    if (message === 'Recipient email is required.' || message === 'Enter a valid recipient email address.') {
      return NextResponse.json({ message }, { status: 400 });
    }

    const classified = classifyMailError(error);
    return NextResponse.json({ message: classified.userMessage }, { status: classified.status });
  }
}
