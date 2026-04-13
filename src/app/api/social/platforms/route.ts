import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getBlotatoClient } from '@/lib/blotato-client';

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const client = getBlotatoClient();

  if (!client.isConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Blotato is not configured. Set BLOTATO_API_KEY to enable.',
      platforms: [],
    });
  }

  try {
    const platforms = await client.getConnectedPlatforms();
    return NextResponse.json({ configured: true, platforms });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch platforms.' },
      { status: 500 },
    );
  }
}
