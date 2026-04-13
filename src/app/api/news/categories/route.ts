import { NextResponse } from 'next/server';
import { listCategories, createCategory } from '@/lib/news';
import { requireApiKey } from '@/lib/api-auth';


export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { name, description } = (await request.json()) as { name: string; description?: string };
    const category = await createCategory(name, description);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to create category.' },
      { status: 400 },
    );
  }
}
