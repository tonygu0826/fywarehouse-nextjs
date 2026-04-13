// BorderConnect REST API client for RNS/PARS status queries
// Architecture: periodically poll Receive endpoint → store locally → instant customer lookup

import * as fs from 'fs';
import * as path from 'path';

const SEND_URL = process.env.BORDERCONNECT_SEND_URL || 'https://borderconnect.com/api/send/Fengye';
const RECEIVE_URL = process.env.BORDERCONNECT_RECEIVE_URL || 'https://borderconnect.com/api/receive/Fengye';
const API_KEY = process.env.BORDERCONNECT_API_KEY || '';
const COMPANY_KEY = process.env.BORDERCONNECT_COMPANY_KEY || '';

const DATA_DIR = path.join(process.cwd(), 'data', 'tracking');
const SHIPMENTS_FILE = path.join(DATA_DIR, 'shipments.json');

export type ShipmentStatus = {
  ccn: string;
  status: 'accepted' | 'released' | 'not_on_file' | 'pending' | 'error' | 'held' | 'examination';
  statusText: string;
  statusLong?: string;
  releaseCode?: string;
  transactionNumber?: string;
  releaseOffice?: string;
  releaseOfficeName?: string;
  driverName?: string;
  serviceOption?: string;
  containerNumber?: string;
  deliveryInstructions?: string;
  timestamp?: string;
  rawResponse?: unknown;
};

// ── Local shipment store ──

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadShipments(): Record<string, ShipmentStatus> {
  try {
    if (fs.existsSync(SHIPMENTS_FILE)) {
      return JSON.parse(fs.readFileSync(SHIPMENTS_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

function saveShipments(data: Record<string, ShipmentStatus>) {
  ensureDir();
  fs.writeFileSync(SHIPMENTS_FILE, JSON.stringify(data, null, 2));
}

// In-memory rate-limit cache for Status Query requests
const queryCache = new Map<string, { result: ShipmentStatus; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function normalizeCcn(ccn: string): string {
  return ccn.trim().replace(/\s+/g, '').toUpperCase();
}

// Send a status query for a CCN number
export async function sendStatusQuery(ccn: string) {
  const payload = {
    rnsSendRequest: {
      data: 'RNS_SEND_REQUEST',
      companyKey: COMPANY_KEY,
      type: 'STATUS_QUERY',
      cargoControlNumbers: [normalizeCcn(ccn)],
    },
  };

  const response = await fetch(SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`BorderConnect send failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Poll for status query results
export async function receiveMessages() {
  const response = await fetch(RECEIVE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`BorderConnect receive failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Parse RNS release code to our status type
function parseReleaseCode(code: string): ShipmentStatus['status'] {
  switch (code) {
    case '4': return 'released';       // Goods Released
    case '5': return 'examination';    // Examination Required
    case '1': return 'accepted';       // Accepted
    case '3': return 'held';           // Held
    case '12': return 'not_on_file';   // Not On File
    default: return 'pending';
  }
}

function parseRnsShipment(msg: any): ShipmentStatus {
  const ccn = normalizeCcn(msg.cargoControlNumber || '');
  const statusObj = msg.status || {};
  const releaseCode = statusObj.releaseCode || {};
  const releaseOfficeObj = msg.releaseOffice || {};

  const status = releaseCode.number ? parseReleaseCode(releaseCode.number) : 'accepted';

  return {
    ccn,
    status,
    statusText: releaseCode.shortName || status,
    statusLong: releaseCode.longName || '',
    releaseCode: releaseCode.number,
    transactionNumber: msg.transactionNumber,
    releaseOffice: releaseOfficeObj.number,
    releaseOfficeName: releaseOfficeObj.name,
    driverName: msg.driverName,
    serviceOption: msg.serviceOption?.name,
    containerNumber: msg.containerNumber,
    deliveryInstructions: statusObj.deliveryInstructions,
    timestamp: statusObj.dateTime || new Date().toISOString(),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Sync: pull all new RNS messages from BorderConnect and store locally ──
export async function syncShipments(): Promise<number> {
  try {
    const messages = await receiveMessages();
    const msgList = Array.isArray(messages) ? messages : [];
    if (msgList.length === 0) return 0;

    const store = loadShipments();
    let count = 0;

    for (const msg of msgList) {
      // Each message may be wrapped as { rnsShipment: {...} } or flat
      const shipment = msg.rnsShipment || msg;
      if (!shipment.cargoControlNumber) continue;

      const parsed = parseRnsShipment(shipment);
      store[parsed.ccn] = parsed;
      count++;
    }

    saveShipments(store);
    return count;
  } catch {
    return 0;
  }
}

// ── Main query function: instant local lookup + optional CBSA query ──
export async function queryShipmentStatus(ccn: string): Promise<ShipmentStatus> {
  const normalized = normalizeCcn(ccn);

  // Check in-memory cache first
  const cached = queryCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  // Sync latest messages from BorderConnect before looking up
  await syncShipments();

  // Check local store
  const store = loadShipments();
  if (store[normalized]) {
    const result = store[normalized];
    queryCache.set(normalized, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  }

  // Not found locally — send Status Query to CBSA in background (don't wait)
  sendStatusQuery(normalized).catch(() => { /* fire and forget */ });

  // Return immediately with not_on_file
  return {
    ccn: normalized,
    status: 'not_on_file',
    statusText: 'No record found. If recently filed, please try again in a few minutes.',
    timestamp: new Date().toISOString(),
  };
}

// ── Manual import: add a shipment record directly ──
export function importShipment(shipment: ShipmentStatus) {
  const store = loadShipments();
  store[normalizeCcn(shipment.ccn)] = { ...shipment, ccn: normalizeCcn(shipment.ccn) };
  saveShipments(store);
}

// ── Bulk import from array ──
export function importShipments(shipments: ShipmentStatus[]) {
  const store = loadShipments();
  for (const s of shipments) {
    store[normalizeCcn(s.ccn)] = { ...s, ccn: normalizeCcn(s.ccn) };
  }
  saveShipments(store);
}

// ── Get all stored shipments ──
export function getAllShipments(): ShipmentStatus[] {
  return Object.values(loadShipments());
}
