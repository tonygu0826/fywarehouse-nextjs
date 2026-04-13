// Google Search Console API client
// Uses service account JWT for authentication

import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const GSC_API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
const SITE_URL = process.env.GSC_SITE_URL || 'https://www.fywarehouse.com/';

// ==================== Types ====================

export type SearchAnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchAnalyticsResponse = {
  rows: SearchAnalyticsRow[];
  responseAggregationType: string;
};

export type DailyTraffic = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type TopQuery = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type TopPage = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscDashboardData = {
  dailyTraffic: DailyTraffic[];
  topQueries: TopQuery[];
  topPages: TopPage[];
  totals: {
    clicks: number;
    impressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  dateRange: { start: string; end: string };
};

// ==================== Auth ====================

let authClient: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (authClient) return authClient;

  const credPath = path.join(process.cwd(), 'data', 'gsc-service-account.json');

  if (!fs.existsSync(credPath)) {
    throw new Error('GSC service account key not found at data/gsc-service-account.json');
  }

  const credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));

  authClient = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  return authClient;
}

async function gscFetch<T>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  const auth = getAuth();
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const url = `${GSC_API_BASE}${endpoint}`;
  const options: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GSC API error (${res.status}): ${error}`);
  }

  return res.json();
}

// ==================== API Calls ====================

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export async function getDailyTraffic(days = 28): Promise<DailyTraffic[]> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3); // GSC data has ~3 day delay
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const data = await gscFetch<SearchAnalyticsResponse>(
    `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['date'],
      rowLimit: days,
    },
  );

  return (data.rows || []).map((row) => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 10000) / 100, // to percentage
    position: Math.round(row.position * 10) / 10,
  }));
}

export async function getTopQueries(limit = 20, days = 28): Promise<TopQuery[]> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const data = await gscFetch<SearchAnalyticsResponse>(
    `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['query'],
      rowLimit: limit,
    },
  );

  return (data.rows || []).map((row) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 10000) / 100,
    position: Math.round(row.position * 10) / 10,
  }));
}

export async function getTopPages(limit = 20, days = 28): Promise<TopPage[]> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const data = await gscFetch<SearchAnalyticsResponse>(
    `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['page'],
      rowLimit: limit,
    },
  );

  return (data.rows || []).map((row) => ({
    page: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 10000) / 100,
    position: Math.round(row.position * 10) / 10,
  }));
}

export async function getGscDashboardData(days = 28): Promise<GscDashboardData> {
  const [dailyTraffic, topQueries, topPages] = await Promise.all([
    getDailyTraffic(days),
    getTopQueries(20, days),
    getTopPages(20, days),
  ]);

  const totals = dailyTraffic.reduce(
    (acc, d) => ({
      clicks: acc.clicks + d.clicks,
      impressions: acc.impressions + d.impressions,
      ctrSum: acc.ctrSum + d.ctr,
      posSum: acc.posSum + d.position,
    }),
    { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0 },
  );

  const count = dailyTraffic.length || 1;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  return {
    dailyTraffic,
    topQueries,
    topPages,
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      avgCtr: Math.round((totals.ctrSum / count) * 100) / 100,
      avgPosition: Math.round((totals.posSum / count) * 10) / 10,
    },
    dateRange: {
      start: formatDate(startDate),
      end: formatDate(endDate),
    },
  };
}
