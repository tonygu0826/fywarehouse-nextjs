import { NextResponse } from 'next/server';
import { createContact, listFymailData, type ContactInput } from '@/lib/fymail';

export const runtime = 'edge';

export async function GET() {
  const store = await listFymailData();
  return NextResponse.json({ contacts: store.contacts });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactInput;
    const contact = await createContact(payload);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to create contact.' },
      { status: 400 },
    );
  }
}
