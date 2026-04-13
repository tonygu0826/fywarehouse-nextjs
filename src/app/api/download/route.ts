import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const FILES: Record<string, { path: string; name: string }> = {
  'euro-contacts': {
    path: '/home/ubuntu/.openclaw/workspace/europe-canada-exporters/output/fymail-contacts-europe-canada.xlsx',
    name: 'fymail-contacts-europe-canada.xlsx',
  },
  'euro-full': {
    path: '/home/ubuntu/.openclaw/workspace/europe-canada-exporters/output/europe-canada-exporters.xlsx',
    name: 'europe-canada-exporters-full.xlsx',
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  const key = searchParams.get('key');

  if (key !== 'fy2026dl') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entry = file ? FILES[file] : null;
  if (!entry) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const data = await readFile(entry.path);
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${entry.name}"`,
        'Content-Length': String(data.length),
      },
    });
  } catch {
    return NextResponse.json({ error: 'File read failed' }, { status: 500 });
  }
}
