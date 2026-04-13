import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { auditAllContent } from '@/lib/content-refresher';

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const audit = await auditAllContent();
  return NextResponse.json(audit);
}
