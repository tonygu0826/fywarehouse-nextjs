import { NextResponse } from 'next/server';
import { getContactById, getTemplateById, renderTemplateContent } from '@/lib/fymail';

export const runtime = 'edge';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const body = (await request.json()) as { contactId?: string };
    const template = await getTemplateById(params.id);
    if (!template) {
      return NextResponse.json({ message: 'Template not found.' }, { status: 404 });
    }

    const contact = body.contactId ? await getContactById(body.contactId) : null;
    if (body.contactId && !contact) {
      return NextResponse.json({ message: 'Contact not found.' }, { status: 404 });
    }

    return NextResponse.json({
      rendered: renderTemplateContent(template, contact),
      contact,
    });
  } catch {
    return NextResponse.json({ message: 'Unable to preview template.' }, { status: 400 });
  }
}
