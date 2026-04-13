import { NextResponse } from 'next/server';
import { importShipment, importShipments, type ShipmentStatus } from '@/lib/borderconnect';

const API_KEY = process.env.NEWS_API_KEY || process.env.API_SECRET_KEY || '';

function isAuthorized(request: Request): boolean {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ') && auth.slice(7) === API_KEY) return true;
  return false;
}

/**
 * POST /api/tracking/import — Import shipment records manually
 * Requires Authorization: Bearer <API_KEY>
 *
 * Body: single shipment or array of shipments
 * { ccn, status, statusText, transactionNumber?, releaseOffice?, ... }
 * or
 * [ { ccn, ... }, { ccn, ... } ]
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      importShipments(body as ShipmentStatus[]);
      return NextResponse.json({ success: true, imported: body.length });
    }

    if (body.ccn) {
      importShipment(body as ShipmentStatus);
      return NextResponse.json({ success: true, imported: 1 });
    }

    return NextResponse.json({ error: 'Invalid body. Provide a shipment object with ccn field, or an array.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import failed' }, { status: 500 });
  }
}
