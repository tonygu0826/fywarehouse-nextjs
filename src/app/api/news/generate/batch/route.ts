import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { runContentPipeline, type PipelineConfig } from '@/lib/content-pipeline';


export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as Partial<PipelineConfig>;
    const result = await runContentPipeline(body);
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Batch generation failed.' },
      { status: 500 },
    );
  }
}
