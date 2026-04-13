import { NextResponse } from 'next/server';
import { classifyMailError, logContactEvent } from '@/lib/contact-mail';
import { processQueuedSendJobs } from '@/lib/fymail';

export const runtime = 'edge';

export async function POST() {
  try {
    const jobs = await processQueuedSendJobs(1);
    if (jobs[0]) {
      logContactEvent('fymail.bulk_send_processed', {
        jobId: jobs[0].id,
        status: jobs[0].status,
        sentCount: jobs[0].sentCount,
        failedCount: jobs[0].failedCount,
      });
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    const classified = classifyMailError(error);
    return NextResponse.json({ message: classified.userMessage }, { status: classified.status });
  }
}
