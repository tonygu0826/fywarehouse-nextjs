import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getKeywordStorage } from '@/lib/keyword-store';

type RouteContext = { params: { id: string } };

export async function PUT(request: Request, { params }: RouteContext) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const storage = getKeywordStorage();
    const existing = await storage.get(params.id);
    if (!existing) {
      return NextResponse.json({ message: 'Keyword not found.' }, { status: 404 });
    }

    const updates = await request.json();
    const updated = {
      ...existing,
      ...(updates.status && { status: updates.status }),
      ...(updates.category && { category: updates.category }),
      ...(updates.funnelPosition && { funnelPosition: updates.funnelPosition }),
      ...(updates.tags && { tags: updates.tags }),
      updatedAt: new Date().toISOString(),
    };

    await storage.save(updated);
    return NextResponse.json({ keyword: updated });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Update failed.' },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  await getKeywordStorage().delete(params.id);
  return NextResponse.json({ ok: true });
}
