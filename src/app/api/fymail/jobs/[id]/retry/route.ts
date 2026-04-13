import { NextResponse } from 'next/server';
import { retryFailedSendJob } from '@/lib/fymail';

export const runtime = 'edge';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const job = await retryFailedSendJob(params.id);
    return NextResponse.json({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to retry send job.';
    const status = message === 'Send job not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
