import { NextResponse } from 'next/server';
import { logContactEvent } from '@/lib/contact-mail';
import { enqueueBulkSendJob, type BulkSendInput } from '@/lib/fymail';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BulkSendInput;
    const job = await enqueueBulkSendJob(payload);
    logContactEvent('fymail.bulk_send_queued', {
      jobId: job.id,
      templateId: job.templateId,
      totalCount: job.totalCount,
      status: job.status,
    });
    return NextResponse.json({ job }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to run bulk send.';
    if (
      message === 'Template is required.' ||
      message === 'At least one contact is required.' ||
      message === 'No active contacts matched the request.'
    ) {
      return NextResponse.json({ message }, { status: 400 });
    }
    if (message === 'Template not found.') {
      return NextResponse.json({ message }, { status: 404 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
