// Social media post scheduling
// Manages time slots and auto-scheduling for published news

import { getBlotatoClient, type SocialPost, type ScheduleResult } from './blotato-client';
import { generateAllPlatformContent, socialContentToPost } from './social-content-generator';
import type { NewsArticleSummary } from './news';

export type TimeSlot = {
  hour: number;
  minute: number;
};

export type ScheduleConfig = {
  timeSlots: TimeSlot[];     // Daily posting times (UTC)
  timezone: string;           // For display purposes
  platforms: string[];        // Active platforms
};

const DEFAULT_SCHEDULE: ScheduleConfig = {
  timeSlots: [
    { hour: 14, minute: 0 },  // 10 AM ET
    { hour: 19, minute: 0 },  // 3 PM ET
    { hour: 21, minute: 0 },  // 5 PM ET
  ],
  timezone: 'America/Montreal',
  platforms: ['twitter', 'linkedin', 'facebook'],
};

function getNextAvailableSlot(
  config: ScheduleConfig = DEFAULT_SCHEDULE,
  afterDate: Date = new Date(),
): Date {
  const now = new Date(afterDate);

  for (const slot of config.timeSlots) {
    const candidate = new Date(now);
    candidate.setUTCHours(slot.hour, slot.minute, 0, 0);

    if (candidate > now) {
      return candidate;
    }
  }

  // All today's slots passed, use first slot tomorrow
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(config.timeSlots[0].hour, config.timeSlots[0].minute, 0, 0);
  return tomorrow;
}

export async function scheduleNewsToSocial(
  article: NewsArticleSummary,
  scheduledAt?: string,
): Promise<ScheduleResult | null> {
  const client = getBlotatoClient();
  if (!client.isConfigured()) {
    console.warn('Blotato not configured. Skipping social media scheduling.');
    return null;
  }

  const contents = generateAllPlatformContent(article);
  const scheduleTime = scheduledAt || getNextAvailableSlot().toISOString();
  const post = socialContentToPost(contents, scheduleTime);

  return client.schedulePost(post);
}

export async function scheduleBatchToSocial(
  articles: NewsArticleSummary[],
  config: ScheduleConfig = DEFAULT_SCHEDULE,
): Promise<Array<{ slug: string; result: ScheduleResult | null; error?: string }>> {
  const results: Array<{ slug: string; result: ScheduleResult | null; error?: string }> = [];
  let lastScheduled = new Date();

  for (const article of articles) {
    try {
      const slot = getNextAvailableSlot(config, lastScheduled);
      const result = await scheduleNewsToSocial(article, slot.toISOString());
      results.push({ slug: article.slug, result });
      lastScheduled = slot;
    } catch (error) {
      results.push({
        slug: article.slug,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
