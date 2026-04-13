import { NextResponse } from 'next/server';

export function requireApiKey(request: Request): NextResponse | null {
  const authHeader = request.headers.get('Authorization');
  const expectedKey = process.env.NEWS_API_KEY;

  if (!expectedKey) {
    // If no API key is configured, allow all requests (development mode)
    return null;
  }

  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json(
      { message: 'Unauthorized. Provide a valid API key.' },
      { status: 401 },
    );
  }

  return null; // Authorized
}
