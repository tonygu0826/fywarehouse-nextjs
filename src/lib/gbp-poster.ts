// Google Business Profile post automation
// Automatically creates GBP posts when new articles are published
// NOTE: Requires OAuth2 credentials — framework code only, configure auth later

import type { NewsArticleSummary } from './news';

const SITE_URL = 'https://www.fywarehouse.com';

// ==================== Types ====================

export type GbpPostType = 'STANDARD' | 'EVENT' | 'OFFER';

export type GbpCallToAction = {
  actionType: 'LEARN_MORE' | 'BOOK' | 'ORDER' | 'SHOP' | 'SIGN_UP' | 'CALL';
  url: string;
};

export type GbpPost = {
  topicType: GbpPostType;
  languageCode: string;
  summary: string;
  callToAction?: GbpCallToAction;
  event?: {
    title: string;
    schedule: {
      startDate: { year: number; month: number; day: number };
      endDate: { year: number; month: number; day: number };
    };
  };
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
  };
  media?: Array<{
    mediaFormat: 'PHOTO' | 'VIDEO';
    sourceUrl: string;
  }>;
};

export type GbpPostResult = {
  success: boolean;
  postName?: string;
  error?: string;
};

// ==================== Configuration ====================

type GbpConfig = {
  accountId: string;
  locationId: string;
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
};

function getGbpConfig(): GbpConfig | null {
  const accountId = process.env.GBP_ACCOUNT_ID;
  const locationId = process.env.GBP_LOCATION_ID;
  const accessToken = process.env.GBP_ACCESS_TOKEN;
  const refreshToken = process.env.GBP_REFRESH_TOKEN;
  const clientId = process.env.GBP_CLIENT_ID;
  const clientSecret = process.env.GBP_CLIENT_SECRET;

  if (!accountId || !locationId || !clientId || !clientSecret) {
    return null;
  }

  return { accountId, locationId, accessToken: accessToken || '', refreshToken: refreshToken || '', clientId, clientSecret };
}

export function isGbpConfigured(): boolean {
  return getGbpConfig() !== null;
}

// ==================== OAuth2 Token Refresh ====================

async function refreshAccessToken(config: GbpConfig): Promise<string> {
  if (!config.refreshToken) {
    throw new Error('GBP refresh token not configured. Complete OAuth2 flow first.');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh GBP token: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ==================== GBP API ====================

const GBP_API_BASE = 'https://mybusiness.googleapis.com/v4';

async function createGbpPost(post: GbpPost): Promise<GbpPostResult> {
  const config = getGbpConfig();
  if (!config) {
    return { success: false, error: 'GBP not configured. Set GBP_* environment variables.' };
  }

  try {
    let token = config.accessToken;
    if (!token && config.refreshToken) {
      token = await refreshAccessToken(config);
    }

    if (!token) {
      return { success: false, error: 'No valid access token. Complete OAuth2 flow.' };
    }

    const url = `${GBP_API_BASE}/accounts/${config.accountId}/locations/${config.locationId}/localPosts`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: `GBP API error (${res.status}): ${errorText}` };
    }

    const result = await res.json();
    return { success: true, postName: result.name };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown GBP error' };
  }
}

// ==================== Content Generation ====================

export function generateGbpPostFromArticle(
  article: NewsArticleSummary,
  postType: GbpPostType = 'STANDARD',
): GbpPost {
  const articleUrl = `${SITE_URL}/news/${article.slug}`;

  // Truncate summary to 1500 chars (GBP limit)
  const summary = article.excerpt
    ? article.excerpt.slice(0, 1400)
    : `${article.title} — Read more about the latest logistics and warehousing insights from FY Warehouse.`;

  const post: GbpPost = {
    topicType: postType,
    languageCode: 'en',
    summary: `${summary}\n\nRead more: ${articleUrl}`,
    callToAction: {
      actionType: 'LEARN_MORE',
      url: articleUrl,
    },
  };

  // Add featured image if available
  if (article.featuredImage) {
    post.media = [
      {
        mediaFormat: 'PHOTO',
        sourceUrl: article.featuredImage.startsWith('http')
          ? article.featuredImage
          : `${SITE_URL}${article.featuredImage}`,
      },
    ];
  }

  return post;
}

export function generateGbpEventPost(
  title: string,
  summary: string,
  eventUrl: string,
  startDate: Date,
  endDate: Date,
): GbpPost {
  return {
    topicType: 'EVENT',
    languageCode: 'en',
    summary,
    callToAction: {
      actionType: 'LEARN_MORE',
      url: eventUrl,
    },
    event: {
      title,
      schedule: {
        startDate: {
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: startDate.getDate(),
        },
        endDate: {
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate(),
        },
      },
    },
  };
}

export function generateGbpOfferPost(
  summary: string,
  offerUrl: string,
  couponCode?: string,
  terms?: string,
): GbpPost {
  return {
    topicType: 'OFFER',
    languageCode: 'en',
    summary,
    callToAction: {
      actionType: 'ORDER',
      url: offerUrl,
    },
    offer: {
      couponCode,
      redeemOnlineUrl: offerUrl,
      termsConditions: terms,
    },
  };
}

// ==================== Pipeline Integration ====================

/**
 * Publish a GBP post for a newly published article.
 * Called from content-pipeline.ts after article publication.
 * Returns silently if GBP is not configured.
 */
export async function publishArticleToGbp(
  article: NewsArticleSummary,
  postType: GbpPostType = 'STANDARD',
): Promise<GbpPostResult> {
  if (!isGbpConfigured()) {
    return { success: false, error: 'GBP not configured — skipping.' };
  }

  const post = generateGbpPostFromArticle(article, postType);
  return createGbpPost(post);
}
