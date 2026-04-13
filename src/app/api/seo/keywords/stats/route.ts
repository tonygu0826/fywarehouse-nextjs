import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getKeywordStats } from '@/lib/keyword-research';

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const stats = await getKeywordStats();
  return NextResponse.json(stats);
}
