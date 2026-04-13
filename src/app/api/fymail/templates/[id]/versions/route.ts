import { NextResponse } from 'next/server';
import { createTemplateVersion, type TemplateInput } from '@/lib/fymail';

export const runtime = 'edge';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const payload = (await request.json()) as TemplateInput | undefined;
    const template = await createTemplateVersion(params.id, payload);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create template version.';
    const status = message === 'Template not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}