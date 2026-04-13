import { NextResponse } from 'next/server';
import { deleteContact, updateContact, type ContactInput } from '@/lib/fymail';

export const runtime = 'edge';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const payload = (await request.json()) as ContactInput;
    const contact = await updateContact(params.id, payload);
    return NextResponse.json({ contact });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update contact.';
    const status = message === 'Contact not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await deleteContact(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete contact.';
    const status = message === 'Contact not found.' ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
