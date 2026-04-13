import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getBlotatoClient } from '@/lib/blotato-client';


export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const client = getBlotatoClient();
    if (!client.isConfigured()) {
      return NextResponse.json(
        { message: 'Blotato is not configured.', posts: [] },
        { status: 200 },
      );
    }

    const posts = await client.getScheduledPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch posts.' },
      { status: 500 },
    );
  }
}
