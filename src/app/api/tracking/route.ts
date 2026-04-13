import { NextResponse } from 'next/server';
import { queryShipmentStatus } from '@/lib/borderconnect';

export async function POST(request: Request) {
  let body: { ccn?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { ccn } = body;

  if (!ccn || typeof ccn !== 'string' || ccn.trim().length < 4) {
    return NextResponse.json(
      { success: false, error: 'Invalid CCN number. Please enter at least 4 characters.' },
      { status: 400 }
    );
  }

  // Basic sanitization: only allow alphanumeric, hyphens, spaces
  const sanitized = ccn.trim().replace(/[^a-zA-Z0-9\-\s]/g, '');
  if (sanitized.length < 4) {
    return NextResponse.json(
      { success: false, error: 'Invalid CCN number format.' },
      { status: 400 }
    );
  }

  try {
    const status = await queryShipmentStatus(sanitized);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('Tracking query failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query shipment status. Please try again later.' },
      { status: 500 }
    );
  }
}
