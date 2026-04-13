/**
 * Assign unique featured images to all news articles.
 * Each article gets a different image — no duplicates.
 *
 * Usage: npx tsx scripts/assign-article-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'news');
const ARTICLES_DIR = path.join(DATA_DIR, 'articles');

// 21+ verified Unsplash images (all return 200), each unique
const UNIQUE_IMAGES: Array<{ url: string; theme: string }> = [
  { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', theme: 'warehouse interior' },
  { url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80', theme: 'warehouse shelves' },
  { url: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=1200&q=80', theme: 'warehouse logistics' },
  { url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80', theme: 'shipping containers' },
  { url: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1200&q=80', theme: 'cargo storage' },
  { url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80', theme: 'container ship' },
  { url: 'https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?auto=format&fit=crop&w=1200&q=80', theme: 'freight train' },
  { url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80', theme: 'business documents' },
  { url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80', theme: 'financial analysis' },
  { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80', theme: 'business professional' },
  { url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80', theme: 'logistics truck' },
  { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1200&q=80', theme: 'delivery van' },
  { url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80', theme: 'cargo loading' },
  { url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80', theme: 'global trade' },
  { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', theme: 'trade analytics' },
  { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', theme: 'data dashboard' },
  { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', theme: 'automation robot' },
  { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', theme: 'technology circuit' },
  { url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80', theme: 'tech innovation' },
  { url: 'https://images.unsplash.com/photo-1519178614-68673b201f36?auto=format&fit=crop&w=1200&q=80', theme: 'montreal cityscape' },
  { url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1200&q=80', theme: 'cold storage' },
  { url: 'https://images.unsplash.com/photo-1462989856370-729a9c1e2c91?auto=format&fit=crop&w=1200&q=80', theme: 'city aerial view' },
  { url: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?auto=format&fit=crop&w=1200&q=80', theme: 'temperature control' },
  { url: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?auto=format&fit=crop&w=1200&q=80', theme: 'supply chain planning' },
  { url: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?auto=format&fit=crop&w=1200&q=80', theme: 'forklift warehouse' },
];

// Score how well an image matches an article
function matchScore(article: any, image: { url: string; theme: string }): number {
  const text = `${article.title} ${article.category} ${(article.tags || []).join(' ')}`.toLowerCase();
  const theme = image.theme.toLowerCase();
  const words = theme.split(' ');
  let score = 0;
  for (const w of words) {
    if (text.includes(w)) score += 10;
  }
  // Category-specific boosts
  if (text.includes('customs') && theme.includes('business')) score += 5;
  if (text.includes('cold chain') && theme.includes('cold')) score += 15;
  if (text.includes('automation') && theme.includes('robot')) score += 15;
  if (text.includes('warehouse') && theme.includes('warehouse')) score += 5;
  if (text.includes('shipping') && (theme.includes('container') || theme.includes('ship'))) score += 5;
  if (text.includes('montreal') && theme.includes('montreal')) score += 8;
  if (text.includes('trade') && theme.includes('trade')) score += 5;
  return score;
}

async function main() {
  const indexPath = path.join(DATA_DIR, 'index.json');
  const index: any[] = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  const available = [...UNIQUE_IMAGES];
  const assignments: Array<{ article: any; image: typeof UNIQUE_IMAGES[0] }> = [];

  // Sort articles and greedily assign best-matching unique images
  for (const summary of index) {
    if (available.length === 0) break;

    // Score all available images
    const scored = available.map((img, idx) => ({ img, idx, score: matchScore(summary, img) }));
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    assignments.push({ article: summary, image: best.img });
    available.splice(best.idx, 1); // Remove used image
  }

  // Apply assignments
  let updated = 0;
  for (const { article, image } of assignments) {
    const articlePath = path.join(ARTICLES_DIR, `${article.slug}.json`);
    if (!fs.existsSync(articlePath)) continue;

    const full = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
    full.featuredImage = image.url;
    full.featuredImageAlt = `${full.title} - ${full.category} | FENGYE LOGISTICS`;
    fs.writeFileSync(articlePath, JSON.stringify(full, null, 2));

    article.featuredImage = image.url;
    article.featuredImageAlt = full.featuredImageAlt;

    console.log(`✓ ${article.slug.slice(0, 50).padEnd(52)} → ${image.theme}`);
    updated++;
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  // Verify no duplicates
  const urls = assignments.map(a => a.image.url);
  const unique = new Set(urls);
  console.log(`\nDone: ${updated} articles, ${unique.size} unique images (duplicates: ${urls.length - unique.size})`);
}

main().catch(console.error);
