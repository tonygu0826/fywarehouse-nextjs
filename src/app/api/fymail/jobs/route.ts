import { NextResponse } from 'next/server';
import { listSendJobs } from '@/lib/fymail';

export const runtime = 'edge';

export async function GET() {
  const jobs = await listSendJobs();
  return NextResponse.json({ jobs });
}
