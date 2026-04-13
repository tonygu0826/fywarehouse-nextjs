import { NextResponse } from 'next/server';
import { getPublishedArticle } from '@/lib/news';

// ==================== Helper Functions ====================

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Sanitize HTML content for AMP compatibility:
 * - Replace <img> with <amp-img> (with layout="responsive" and default dimensions)
 * - Remove <style> tags and inline style attributes
 * - Remove <script> tags
 * - Remove <iframe> tags (would need <amp-iframe> but skip for simplicity)
 * - Remove disallowed attributes like onclick, onload, etc.
 */
function sanitizeForAmp(html: string): string {
  let result = html;

  // Remove <script> tags and their content
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Remove <style> tags and their content
  result = result.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Remove inline style attributes
  result = result.replace(/\s+style\s*=\s*"[^"]*"/gi, '');
  result = result.replace(/\s+style\s*=\s*'[^']*'/gi, '');

  // Remove event handler attributes (onclick, onload, onerror, etc.)
  result = result.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');

  // Remove <iframe> tags
  result = result.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  result = result.replace(/<iframe[^>]*\/?>/gi, '');

  // Replace <img> with <amp-img>
  result = result.replace(
    /<img\s([^>]*?)\/?>/gi,
    (match: string, attrs: string) => {
      // Extract src
      const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
      const altMatch = attrs.match(/alt\s*=\s*["']([^"']*?)["']/i);
      const widthMatch = attrs.match(/width\s*=\s*["']?(\d+)["']?/i);
      const heightMatch = attrs.match(/height\s*=\s*["']?(\d+)["']?/i);

      if (!srcMatch) return '';

      const src = srcMatch[1];
      const alt = altMatch ? altMatch[1] : '';
      const width = widthMatch ? widthMatch[1] : '800';
      const height = heightMatch ? heightMatch[1] : '450';

      return `<amp-img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" layout="responsive"></amp-img>`;
    },
  );

  // Remove any remaining disallowed attributes: class is allowed, but clean up just in case
  // Remove target="_blank" from links (allowed in AMP, but let's keep it)

  return result;
}

// ==================== Route Handler ====================

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const article = await getPublishedArticle(params.slug);
  if (!article) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const ampContent = sanitizeForAmp(article.content);
  const publishedDate = article.publishedAt || article.createdAt;
  const modifiedDate = article.updatedAt || publishedDate;
  const currentYear = new Date().getFullYear();

  const html = `<!doctype html>
<html amp lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${escapeHtml(article.title)} | FENGYE LOGISTICS</title>
  <link rel="canonical" href="https://www.fywarehouse.com/news/${article.slug}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${escapeHtml(article.metaDescription)}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${escapeJson(article.title)}",
    "datePublished": "${publishedDate}",
    "dateModified": "${modifiedDate}",
    "author": {
      "@type": "Organization",
      "name": "${escapeJson(article.author)}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FENGYE LOGISTICS",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.fywarehouse.com/assets/logo-full-transparent.png",
        "width": 300,
        "height": 60
      }
    },
    "mainEntityOfPage": "https://www.fywarehouse.com/news/${article.slug}",
    "description": "${escapeJson(article.metaDescription)}"${article.featuredImage ? `,
    "image": "${escapeJson(article.featuredImage)}"` : ''}
  }
  </script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; color: #334155; background: #fff; }
    .header { background: #0f3d91; color: #fff; padding: 16px 20px; }
    .header a { color: #fff; text-decoration: none; font-weight: 700; font-size: 18px; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    .breadcrumb { padding: 12px 0; font-size: 14px; color: #64748b; }
    .breadcrumb a { color: #0f3d91; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    h1 { font-size: 28px; line-height: 1.3; color: #0f172a; margin: 16px 0 12px; }
    .meta { font-size: 14px; color: #64748b; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
    .content { line-height: 1.8; font-size: 16px; }
    .content h2 { font-size: 22px; color: #0f172a; margin: 28px 0 12px; }
    .content h3 { font-size: 18px; color: #0f172a; margin: 24px 0 10px; }
    .content p { margin: 0 0 16px; }
    .content a { color: #0f3d91; text-decoration: underline; }
    .content ul, .content ol { margin: 0 0 16px; padding-left: 24px; }
    .content li { margin-bottom: 6px; }
    .content blockquote { border-left: 4px solid #0f3d91; margin: 16px 0; padding: 12px 20px; background: #f8fafc; color: #475569; }
    .content table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .content th, .content td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    .content th { background: #f1f5f9; font-weight: 600; }
    .featured-image { margin: 0 0 24px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0; }
    .tag { background: #f0f0f0; padding: 4px 12px; border-radius: 16px; font-size: 13px; color: #64748b; text-decoration: none; }
    .back-link { display: inline-block; margin: 24px 0; color: #0f3d91; text-decoration: none; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    .footer { background: #f2f2f2; padding: 24px 20px; margin-top: 40px; text-align: center; font-size: 14px; color: #64748b; }
    .footer a { color: #0f3d91; text-decoration: none; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <a href="https://www.fywarehouse.com">FENGYE LOGISTICS</a>
    </div>
  </header>
  <main class="container">
    <nav class="breadcrumb">
      <a href="https://www.fywarehouse.com">Home</a> &gt;
      <a href="https://www.fywarehouse.com/news">News</a> &gt;
      ${escapeHtml(article.title)}
    </nav>
    <article>
      <h1>${escapeHtml(article.title)}</h1>
      <div class="meta">
        ${escapeHtml(article.category)} &middot; ${formatDate(publishedDate)} &middot; By ${escapeHtml(article.author)} &middot; ${article.readingTimeMinutes} min read
      </div>${article.featuredImage ? `
      <div class="featured-image">
        <amp-img src="${escapeHtml(article.featuredImage)}" alt="${escapeHtml(article.featuredImageAlt || article.title)}" width="800" height="450" layout="responsive"></amp-img>
      </div>` : ''}
      <div class="content">
        ${ampContent}
      </div>${article.tags?.length ? `
      <div class="tags">${article.tags.map((t: string) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      <a class="back-link" href="https://www.fywarehouse.com/news">&larr; Back to News</a>
    </article>
  </main>
  <footer class="footer">
    <div class="container">
      &copy; ${currentYear} <a href="https://www.fywarehouse.com">FENGYE LOGISTICS</a>. All rights reserved.
    </div>
  </footer>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
