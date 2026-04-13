// Persistent news source management
// Allows dynamic add/remove of RSS feed sources

import type { NewsSource } from './news-scraper';
import { DEFAULT_NEWS_SOURCES } from './news-scraper';

const SOURCES_FILE = 'news-sources.json';

export async function getSavedSources(): Promise<NewsSource[]> {
  try {
    const fs = await import('fs');
    const cwd = process.cwd();
    const path = `${cwd}/data/${SOURCES_FILE}`;
    if (!fs.existsSync(path)) return [];
    return JSON.parse(fs.readFileSync(path, 'utf-8')) as NewsSource[];
  } catch {
    return [];
  }
}

export async function saveSources(sources: NewsSource[]): Promise<void> {
  const fs = await import('fs');
  const cwd = process.cwd();
  const dir = `${cwd}/data`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/${SOURCES_FILE}`, JSON.stringify(sources, null, 2));
}

export async function getAllSources(): Promise<NewsSource[]> {
  const custom = await getSavedSources();
  if (custom.length > 0) return custom;
  return DEFAULT_NEWS_SOURCES;
}

export async function addSource(source: NewsSource): Promise<NewsSource[]> {
  const current = await getAllSources();
  if (current.some((s) => s.feedUrl === source.feedUrl)) {
    throw new Error('Source with this URL already exists.');
  }
  current.push(source);
  await saveSources(current);
  return current;
}

export async function removeSource(feedUrl: string): Promise<NewsSource[]> {
  const current = await getAllSources();
  const filtered = current.filter((s) => s.feedUrl !== feedUrl);
  if (filtered.length === current.length) {
    throw new Error('Source not found.');
  }
  await saveSources(filtered);
  return filtered;
}
