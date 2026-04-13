// Claude API powered content generator
// Produces unique, high-quality SEO articles for each keyword

import { MONEY_PAGES, BRAND_NAMES } from './money-pages';
import type { ScrapedNews } from './news-scraper';
import { pickFeaturedImage } from './article-image-picker';

// ==================== Robust JSON Parser ====================

type ParsedArticle = {
  title: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  tags: string[];
  secondaryKeywords: string[];
};

function parseClaudeJson(raw: string): ParsedArticle {
  // Step 1: Strip markdown code fences
  let cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Step 2: Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch { /* continue */ }

  // Step 3: Find the outermost JSON object by counting braces
  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error(`No JSON object found in response: ${raw.slice(0, 150)}`);

  let depth = 0;
  let end = -1;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
  }

  if (end === -1) throw new Error(`Incomplete JSON in response: ${raw.slice(0, 150)}`);

  const jsonStr = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse extracted JSON: ${jsonStr.slice(0, 150)}`);
  }
}
import type { InternalLink } from './news-store';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001'; // Fast + cheap for content generation

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not configured.');
  return key;
}

function brandName(): string {
  return BRAND_NAMES[Math.floor(Math.random() * BRAND_NAMES.length)];
}

function buildMoneyPagesContext(): string {
  return MONEY_PAGES.map(
    (p) => `- ${p.title}: ${p.url} (anchor text options: ${p.anchorVariants.slice(0, 3).join(', ')})`,
  ).join('\n');
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// ==================== System Prompts ====================

const SEO_SYSTEM_PROMPT = `You are an expert SEO content writer for FENGYE LOGISTICS (also known as FENGYE Warehouse), a sufferance warehouse and logistics company based in Montreal, Canada.

Your writing guidelines:
- Write in professional, authoritative English
- Target Canadian businesses (importers, exporters, e-commerce, distributors)
- Naturally embed the brand name "FENGYE LOGISTICS" or "FENGYE Warehouse" 2-3 times in the article (not forced, naturally woven in as industry expert references)
- Include 2 internal links using HTML <a> tags pointing to money pages (provided below)
- Use proper HTML structure: <h2>, <h3>, <p>, <ul>/<ol>, <strong>
- Do NOT use <h1> (the title is rendered separately)
- Do NOT include markdown — output pure HTML only
- Each article should be 800-1200 words
- Include actionable advice, statistics where relevant, and Montreal-specific context
- End with a forward-looking conclusion
- IMPORTANT: Start every article with a "Key Takeaways" section immediately after the first <h2>. Format it as: <div class="key-takeaways"><h2>Key Takeaways</h2><ul><li>Point 1</li><li>Point 2</li><li>Point 3</li><li>Point 4 (optional)</li><li>Point 5 (optional)</li></ul></div>. Include 3-5 concise, actionable bullet points summarizing the article's main insights. This section helps readers quickly grasp the article's value and improves AI search engine visibility.

Money pages to link to (use 2 of these naturally in the content):
${buildMoneyPagesContext()}

Brand names to use (pick randomly, vary across the article):
${BRAND_NAMES.join(', ')}`;

// ==================== Article Generation ====================

export type AIGeneratedArticle = {
  title: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string[];
  targetKeyword: string;
  secondaryKeywords: string[];
  internalLinks: InternalLink[];
  source: 'ai-generated' | 'hybrid';
  sourceUrl: string | null;
};

export async function generateArticleWithAI(
  keyword: string,
  category: string,
): Promise<AIGeneratedArticle> {
  const userPrompt = `Write a comprehensive SEO article targeting the keyword: "${keyword}"
Category: ${category}

Requirements:
1. Create an engaging, SEO-optimized title (50-65 characters)
2. Write a meta description (130-155 characters)
3. Write a 3-sentence excerpt/summary
4. Write the full article body in HTML (800-1200 words)
5. Suggest 5 relevant tags

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "title": "...",
  "metaDescription": "...",
  "excerpt": "...",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const raw = await callClaude(SEO_SYSTEM_PROMPT, userPrompt);
  const parsed = parseClaudeJson(raw);

  // Extract internal links from content
  const linkRegex = /<a href="([^"]+)">([^<]+)<\/a>/g;
  const internalLinks: InternalLink[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(parsed.content)) !== null) {
    const url = match[1];
    const isMoneyPage = MONEY_PAGES.some((p) => url.includes(p.url) || p.url.includes(url));
    internalLinks.push({
      url: match[1],
      anchorText: match[2],
      type: isMoneyPage ? 'money-page' : 'news-article',
    });
  }

  return {
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    excerpt: parsed.excerpt,
    content: parsed.content,
    featuredImage: await pickFeaturedImage(parsed.title, parsed.tags || [], category),
    featuredImageAlt: parsed.title,
    category,
    tags: parsed.tags || [],
    targetKeyword: keyword,
    secondaryKeywords: parsed.secondaryKeywords || [],
    internalLinks,
    source: 'ai-generated',
    sourceUrl: null,
  };
}

export async function rewriteNewsWithAI(
  news: ScrapedNews,
  targetKeyword?: string,
): Promise<AIGeneratedArticle> {
  const keywordInstruction = targetKeyword
    ? `\n\nPRIMARY TARGET KEYWORD: "${targetKeyword}"
You MUST use this exact keyword (or a very close variant) in:
- The <h1>/title
- The first paragraph (within the first 100 words)
- The meta description
- At least one <h2> subheading
Use it naturally — do not keyword-stuff.\n`
    : '';

  const userPrompt = `Rewrite the following industry news into an original, SEO-optimized article for a Canadian warehousing/logistics audience. DO NOT copy the original — create a completely new article that analyzes the topic from a Montreal warehousing perspective.${keywordInstruction}

Original headline: ${news.title}
Original summary: ${news.description}
Source: ${news.source}

Requirements:
1. Create a new, unique title focusing on Canadian/Montreal warehousing implications (50-65 chars)${targetKeyword ? ` — MUST include "${targetKeyword}"` : ''}
2. Write a meta description (130-155 characters)${targetKeyword ? ` — MUST include "${targetKeyword}"` : ''}
3. Write a 3-sentence excerpt
4. Write the full article in HTML (800-1200 words), analyzing what this means for Canadian businesses
5. Suggest 5 relevant tags

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "title": "...",
  "metaDescription": "...",
  "excerpt": "...",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const raw = await callClaude(SEO_SYSTEM_PROMPT, userPrompt);
  const parsed = parseClaudeJson(raw);

  const linkRegex = /<a href="([^"]+)">([^<]+)<\/a>/g;
  const internalLinks: InternalLink[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(parsed.content)) !== null) {
    const url = match[1];
    const isMoneyPage = MONEY_PAGES.some((p) => url.includes(p.url) || p.url.includes(url));
    internalLinks.push({
      url: match[1],
      anchorText: match[2],
      type: isMoneyPage ? 'money-page' : 'news-article',
    });
  }

  return {
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    excerpt: parsed.excerpt,
    content: parsed.content,
    featuredImage: await pickFeaturedImage(parsed.title, parsed.tags || [], 'Industry News'),
    featuredImageAlt: parsed.title,
    category: 'Industry News',
    tags: parsed.tags || [],
    targetKeyword: targetKeyword || news.title.toLowerCase().split(' ').slice(0, 5).join(' '),
    secondaryKeywords: parsed.secondaryKeywords || [],
    internalLinks,
    source: 'hybrid',
    sourceUrl: news.link,
  };
}

// Check if AI generation is available
export function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
