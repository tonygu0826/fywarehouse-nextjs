import { NextResponse } from 'next/server';
import { getJobById, filterJobRecipients, generateJobCSV } from '@/lib/fymail';

export const runtime = 'edge';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const job = await getJobById(params.id);
    if (!job) {
      return NextResponse.json({ message: 'Send job not found.' }, { status: 404 });
    }

    const url = new URL(request.url);
    const filter = (url.searchParams.get('filter') as 'all' | 'failed' | 'sent' | 'pending') || 'all';
    const search = url.searchParams.get('search') || '';

    const recipients = filterJobRecipients(job, filter, search);
    const csvContent = generateJobCSV(job, recipients);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="job-${job.id}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to export job CSV.';
    return NextResponse.json({ message }, { status: 400 });
  }
}

