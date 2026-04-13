// Edge Runtime compatible HTML sanitizer
// Strips dangerous tags and attributes to prevent XSS

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  'a', 'img',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'figure', 'figcaption',
  'div', 'span',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'rel', 'target']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
};

// Attributes allowed on all tags
const GLOBAL_ALLOWED_ATTRS = new Set(['class', 'id']);

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isUrlSafe(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  // Block javascript:, data:, vbscript: protocols
  if (/^(javascript|data|vbscript)\s*:/i.test(trimmed)) return false;
  // Allow http, https, mailto, tel, relative URLs
  if (/^(https?:|mailto:|tel:|\/|#)/.test(trimmed) || !trimmed.includes(':')) return true;
  return false;
}

export function sanitizeHtml(html: string): string {
  // Remove script tags and their content entirely
  let result = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  // Remove style tags and their content
  result = result.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove all event handler attributes (onclick, onerror, onload, etc.)
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  // Remove iframe, object, embed, form, input
  result = result.replace(/<\/?(?:iframe|object|embed|form|input|textarea|button|select)\b[^>]*>/gi, '');

  // Process remaining tags
  result = result.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    const isClosing = match.startsWith('</');

    if (!ALLOWED_TAGS.has(tag)) {
      return ''; // Strip disallowed tags
    }

    if (isClosing) {
      return `</${tag}>`;
    }

    // Process attributes
    const tagAllowed = ALLOWED_ATTRS[tag] || new Set();
    const cleanAttrs: string[] = [];

    const attrRegex = /([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      if (!tagAllowed.has(attrName) && !GLOBAL_ALLOWED_ATTRS.has(attrName)) {
        continue; // Skip disallowed attributes
      }

      // Validate URL attributes
      if ((attrName === 'href' || attrName === 'src') && !isUrlSafe(attrValue)) {
        continue; // Skip dangerous URLs
      }

      cleanAttrs.push(`${attrName}="${escapeAttrValue(attrValue)}"`);
    }

    // Force rel="noopener noreferrer" on external links
    if (tag === 'a' && cleanAttrs.some((a) => a.startsWith('href='))) {
      const hasTarget = cleanAttrs.some((a) => a.startsWith('target='));
      if (hasTarget && !cleanAttrs.some((a) => a.startsWith('rel='))) {
        cleanAttrs.push('rel="noopener noreferrer"');
      }
    }

    // Force loading="lazy" on images
    if (tag === 'img' && !cleanAttrs.some((a) => a.startsWith('loading='))) {
      cleanAttrs.push('loading="lazy"');
    }

    const attrStr = cleanAttrs.length > 0 ? ' ' + cleanAttrs.join(' ') : '';
    const selfClosing = tag === 'br' || tag === 'hr' || tag === 'img';
    return selfClosing ? `<${tag}${attrStr} />` : `<${tag}${attrStr}>`;
  });

  return result;
}
