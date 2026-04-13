// SEO content optimizer
// Validates and scores article content for search engine optimization

import { MONEY_PAGES, getRandomAnchor } from './money-pages';
import type { InternalLink } from './news-store';

export type SeoReport = {
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
};

export function calculateSeoScore(
  content: string,
  title: string,
  metaDescription: string,
  targetKeyword: string,
  internalLinks: InternalLink[],
): SeoReport {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').length;
  const lowerContent = textContent.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerKeyword = targetKeyword.toLowerCase();

  // Title checks (max 20 points)
  if (title.length > 0) score += 5;
  if (title.length >= 30 && title.length <= 70) {
    score += 10;
  } else {
    issues.push(`Title length is ${title.length} chars (ideal: 30-70)`);
  }
  if (lowerTitle.includes(lowerKeyword)) {
    score += 5;
  } else {
    suggestions.push('Include target keyword in the title');
  }

  // Meta description checks (max 15 points)
  if (metaDescription.length > 0) score += 5;
  if (metaDescription.length >= 120 && metaDescription.length <= 160) {
    score += 10;
  } else {
    issues.push(`Meta description is ${metaDescription.length} chars (ideal: 120-160)`);
  }

  // Content length (max 15 points)
  if (wordCount >= 300) score += 5;
  if (wordCount >= 600) score += 5;
  if (wordCount >= 1000) score += 5;
  if (wordCount < 300) {
    issues.push(`Content is only ${wordCount} words (minimum: 300)`);
  }

  // Heading structure (max 15 points)
  const h2Count = (content.match(/<h2/gi) || []).length;
  const h3Count = (content.match(/<h3/gi) || []).length;
  if (h2Count >= 2) score += 10;
  if (h3Count >= 1) score += 5;
  if (h2Count === 0) {
    issues.push('Missing H2 headings');
  }

  // Keyword density (max 10 points)
  if (lowerKeyword) {
    const keywordCount = lowerContent.split(lowerKeyword).length - 1;
    const density = (keywordCount / wordCount) * 100;
    if (density >= 0.5 && density <= 3) {
      score += 10;
    } else if (density < 0.5) {
      suggestions.push('Keyword density is too low. Add more keyword mentions.');
    } else {
      issues.push('Keyword density is too high (>3%). Reduce keyword stuffing.');
    }
  }

  // Internal links (max 15 points)
  const moneyPageLinks = internalLinks.filter((l) => l.type === 'money-page');
  if (moneyPageLinks.length >= 1) score += 8;
  if (moneyPageLinks.length >= 2) score += 7;
  if (moneyPageLinks.length === 0) {
    issues.push('No internal links to money pages');
  }

  // Image alt text (max 5 points)
  const imgTags = content.match(/<img[^>]*>/gi) || [];
  const imgsWithAlt = imgTags.filter((img) => /alt="[^"]+"/i.test(img));
  if (imgTags.length === 0 || imgsWithAlt.length === imgTags.length) {
    score += 5;
  } else {
    issues.push(`${imgTags.length - imgsWithAlt.length} image(s) missing alt text`);
  }

  // Lists (max 5 points)
  const hasList = /<[uo]l>/i.test(content);
  if (hasList) score += 5;
  else suggestions.push('Add bullet points or numbered lists for better readability');

  return {
    score: Math.min(100, score),
    issues,
    suggestions,
  };
}

// Auto-insert internal links if missing
export function ensureInternalLinks(
  content: string,
  existingLinks: InternalLink[],
  minLinks = 2,
): { content: string; links: InternalLink[] } {
  const moneyPageLinks = existingLinks.filter((l) => l.type === 'money-page');

  if (moneyPageLinks.length >= minLinks) {
    return { content, links: existingLinks };
  }

  const needed = minLinks - moneyPageLinks.length;
  const usedUrls = new Set(moneyPageLinks.map((l) => l.url));
  const available = MONEY_PAGES.filter((p) => !usedUrls.has(p.url));
  const toAdd = available.slice(0, needed);

  let updatedContent = content;
  const newLinks: InternalLink[] = [...existingLinks];

  for (const page of toAdd) {
    const anchor = getRandomAnchor(page);
    const link: InternalLink = { url: page.url, anchorText: anchor, type: 'money-page' };
    newLinks.push(link);

    // Insert link before the last closing paragraph
    const lastPIdx = updatedContent.lastIndexOf('</p>');
    if (lastPIdx > 0) {
      const insertHtml = ` Learn more about <a href="${page.url}">${anchor}</a>.`;
      updatedContent =
        updatedContent.slice(0, lastPIdx) + insertHtml + updatedContent.slice(lastPIdx);
    }
  }

  return { content: updatedContent, links: newLinks };
}
