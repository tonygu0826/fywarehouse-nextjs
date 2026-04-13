import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { generateSeoHealthReport } from '@/lib/seo-monitoring';

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const report = await generateSeoHealthReport();
  return NextResponse.json(report);
}
