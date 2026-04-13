import { NextResponse } from 'next/server';
import { deleteTemplate, updateTemplate, type TemplateInput } from '@/lib/fymail';

export const runtime = 'edge';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const payload = (await request.json()) as TemplateInput;
    const template = await updateTemplate(params.id, payload);
    return NextResponse.json({ template });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update template.';
    const status = message === 'Template not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await deleteTemplate(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete template.';
    const status = message === 'Template not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
