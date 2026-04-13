// Generate social media content from news articles
// Adapts content for each platform's format and character limits

import type { NewsArticleSummary } from './news';
import type { SocialPlatform, SocialPost } from './blotato-client';

export type SocialContent = {
  platform: SocialPlatform;
  text: string;
  link: string;
  hashtags: string[];
};

const BASE_URL = 'https://www.fywarehouse.com';

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3).replace(/\s\S*$/, '') + '...';
}

function generateHashtags(article: NewsArticleSummary): string[] {
  const base = ['#Warehousing', '#Logistics', '#SupplyChain', '#Montreal'];
  const fromTags = article.tags
    .slice(0, 3)
    .map((t) => '#' + t.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase()));
  return [...new Set([...fromTags, ...base])].slice(0, 5);
}

export function generateTwitterContent(article: NewsArticleSummary): SocialContent {
  const link = `${BASE_URL}/news/${article.slug}`;
  const hashtags = generateHashtags(article);
  const hashtagStr = hashtags.join(' ');

  // 280 chars total, reserve space for link and hashtags
  const reserved = link.length + 1 + hashtagStr.length + 2;
  const titleMaxLen = 280 - reserved;
  const text = `${truncate(article.title, titleMaxLen)}\n\n${link}\n\n${hashtagStr}`;

  return { platform: 'twitter', text, link, hashtags };
}

export function generateLinkedInContent(article: NewsArticleSummary): SocialContent {
  const link = `${BASE_URL}/news/${article.slug}`;
  const hashtags = generateHashtags(article);

  const text = [
    `${article.title}`,
    '',
    truncate(article.excerpt, 300),
    '',
    `Read more: ${link}`,
    '',
    hashtags.join(' '),
  ].join('\n');

  return { platform: 'linkedin', text, link, hashtags };
}

export function generateFacebookContent(article: NewsArticleSummary): SocialContent {
  const link = `${BASE_URL}/news/${article.slug}`;
  const hashtags = generateHashtags(article);

  const text = [
    `${article.title}`,
    '',
    article.excerpt,
    '',
    `Read the full article: ${link}`,
    '',
    hashtags.join(' '),
  ].join('\n');

  return { platform: 'facebook', text, link, hashtags };
}

export function generateInstagramContent(article: NewsArticleSummary): SocialContent {
  const link = `${BASE_URL}/news/${article.slug}`;
  const hashtags = [
    ...generateHashtags(article),
    '#WarehouseManagement',
    '#CanadaLogistics',
    '#FYWarehouse',
    '#IndustryNews',
  ];

  const text = [
    `${article.title}`,
    '',
    truncate(article.excerpt, 400),
    '',
    'Link in bio',
    '',
    hashtags.join(' '),
  ].join('\n');

  return { platform: 'instagram', text, link, hashtags };
}

export function generateAllPlatformContent(
  article: NewsArticleSummary,
): SocialContent[] {
  return [
    generateTwitterContent(article),
    generateLinkedInContent(article),
    generateFacebookContent(article),
    generateInstagramContent(article),
  ];
}

export function socialContentToPost(
  contents: SocialContent[],
  scheduledAt?: string,
): SocialPost {
  // Use the longest text variant (LinkedIn/Facebook)
  const primary = contents.find((c) => c.platform === 'linkedin') || contents[0];

  return {
    text: primary.text,
    platforms: contents.map((c) => c.platform),
    link: primary.link,
    ...(scheduledAt && { scheduledAt }),
  };
}
