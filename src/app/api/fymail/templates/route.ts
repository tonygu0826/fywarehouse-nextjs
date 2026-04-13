import { NextResponse } from 'next/server';
import { createTemplate, listFymailData, type TemplateInput } from '@/lib/fymail';

export const runtime = 'edge';

export async function GET() {
  const store = await listFymailData();
  return NextResponse.json({ templates: store.templates });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TemplateInput;
    const template = await createTemplate(payload);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to create template.' },
      { status: 400 },
    );
  }
}
