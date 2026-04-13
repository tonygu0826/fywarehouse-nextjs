import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getGscDashboardData } from '@/lib/gsc-client';

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '28', 10);
    const data = await getGscDashboardData(days);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'GSC fetch failed.' },
      { status: 500 },
    );
  }
}
