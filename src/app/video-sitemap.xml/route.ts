import { listPublishedArticles, getArticle } from '@/lib/news';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.fywarehouse.com';

// Regex patterns to extract video embeds from article content
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
const VIMEO_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/g;

type VideoEntry = {
  loc: string;           // page URL containing the video
  title: string;         // video/article title
  description: string;   // video/article description
  thumbnailUrl: string;  // video thumbnail
  contentUrl: string;    // direct video URL or embed URL
  playerUrl: string;     // embeddable player URL
  publicationDate: string;
};

function extractYoutubeVideos(html: string): Array<{ id: string; url: string; thumbnail: string; player: string }> {
  const videos: Array<{ id: string; url: string; thumbnail: string; player: string }> = [];
  const seen = new Set<string>();

  let match;
  const regex = new RegExp(YOUTUBE_REGEX.source, 'g');
  while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      videos.push({
        id,
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        player: `https://www.youtube.com/embed/${id}`,
      });
    }
  }

  return videos;
}

function extractVimeoVideos(html: string): Array<{ id: string; url: string; thumbnail: string; player: string }> {
  const videos: Array<{ id: string; url: string; thumbnail: string; player: string }> = [];
  const seen = new Set<string>();

  let match;
  const regex = new RegExp(VIMEO_REGEX.source, 'g');
  while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      videos.push({
        id,
        url: `https://vimeo.com/${id}`,
        thumbnail: `https://vumbnail.com/${id}.jpg`,
        player: `https://player.vimeo.com/video/${id}`,
      });
    }
  }

  return videos;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildVideoSitemapXml(entries: VideoEntry[]): string {
  const videoEntries = entries
    .map(
      (v) => `  <url>
    <loc>${escapeXml(v.loc)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(v.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(v.title)}</video:title>
      <video:description>${escapeXml(v.description)}</video:description>
      <video:content_loc>${escapeXml(v.contentUrl)}</video:content_loc>
      <video:player_loc>${escapeXml(v.playerUrl)}</video:player_loc>
      <video:publication_date>${v.publicationDate}</video:publication_date>
    </video:video>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoEntries}
</urlset>`;
}

export async function GET() {
  try {
    const articles = await listPublishedArticles();
    const videoEntries: VideoEntry[] = [];

    for (const summary of articles) {
      const article = await getArticle(summary.slug);
      if (!article) continue;

      const youtubeVideos = extractYoutubeVideos(article.content);
      const vimeoVideos = extractVimeoVideos(article.content);

      const pageUrl = `${SITE_URL}/news/${article.slug}`;
      const pubDate = article.publishedAt || article.createdAt;
      const description = article.metaDescription || article.excerpt || article.title;

      for (const yt of youtubeVideos) {
        videoEntries.push({
          loc: pageUrl,
          title: article.title,
          description,
          thumbnailUrl: yt.thumbnail,
          contentUrl: yt.url,
          playerUrl: yt.player,
          publicationDate: new Date(pubDate).toISOString(),
        });
      }

      for (const vm of vimeoVideos) {
        videoEntries.push({
          loc: pageUrl,
          title: article.title,
          description,
          thumbnailUrl: vm.thumbnail,
          contentUrl: vm.url,
          playerUrl: vm.player,
          publicationDate: new Date(pubDate).toISOString(),
        });
      }
    }

    const xml = buildVideoSitemapXml(videoEntries);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    // Return valid but empty video sitemap on error
    const emptyXml = buildVideoSitemapXml([]);
    return new Response(emptyXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
