// Google Indexing API - notify Google when new content is published
// Uses the same service account as GSC

import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const INDEXING_API_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

let authClient: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (authClient) return authClient;

  const credPath = path.join(process.cwd(), 'data', 'gsc-service-account.json');
  if (!fs.existsSync(credPath)) {
    throw new Error('Service account key not found');
  }

  const credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
  authClient = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  return authClient;
}

export async function notifyGoogleIndexing(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getAuth();
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const res = await fetch(INDEXING_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, type }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`Indexing API error (${res.status}):`, error);
      return { success: false, error: `HTTP ${res.status}: ${error.slice(0, 100)}` };
    }

    const data = await res.json();
    console.log(`Indexing API: notified Google about ${url}`, data);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Indexing API failed:', msg);
    return { success: false, error: msg };
  }
}

// Notify Google about a newly published article
export async function indexNewArticle(slug: string): Promise<{ success: boolean; error?: string }> {
  const url = `https://www.fywarehouse.com/news/${slug}`;
  return notifyGoogleIndexing(url);
}

// Batch index multiple URLs
export async function batchIndex(slugs: string[]): Promise<{
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const slug of slugs) {
    const result = await indexNewArticle(slug);
    if (result.success) {
      succeeded++;
    } else {
      failed++;
      if (result.error) errors.push(`${slug}: ${result.error}`);
    }
    // Rate limit: max 200 requests per day, space them out
    await new Promise((r) => setTimeout(r, 500));
  }

  return { succeeded, failed, errors };
}
