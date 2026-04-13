import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getAllSources, addSource, removeSource } from '@/lib/news-sources-store';

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const sources = await getAllSources();
  return NextResponse.json({ sources });
}

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { name, feedUrl, category } = await request.json();
    if (!name || !feedUrl) {
      return NextResponse.json({ message: 'name and feedUrl are required.' }, { status: 400 });
    }
    const sources = await addSource({ name, feedUrl, category: category || 'Industry News' });
    return NextResponse.json({ sources }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to add source.' },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { feedUrl } = await request.json();
    if (!feedUrl) {
      return NextResponse.json({ message: 'feedUrl is required.' }, { status: 400 });
    }
    const sources = await removeSource(feedUrl);
    return NextResponse.json({ sources });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to remove source.' },
      { status: 400 },
    );
  }
}
