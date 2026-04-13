import Link from 'next/link';
import type { NewsArticleSummary } from '@/lib/news';
import styles from './NewsSidebar.module.css';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

type CategoryCount = { name: string; count: number };

type Props = {
  articles: NewsArticleSummary[];
  currentCategory?: string;
};

export function NewsSidebar({ articles, currentCategory }: Props) {
  // Build category counts
  const categoryMap = new Map<string, number>();
  const tagMap = new Map<string, number>();

  for (const a of articles) {
    categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + 1);
    for (const tag of a.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  const categories: CategoryCount[] = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const topTags = Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag]) => tag);

  const recentArticles = articles.slice(0, 5);

  return (
    <aside className={styles.sidebar}>
      {/* Categories */}
      {categories.length > 0 && (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Categories</h3>
          <ul className={styles.categoryList}>
            <li className={styles.categoryItem}>
              <Link
                href="/news"
                className={`${styles.categoryLink} ${!currentCategory ? styles.categoryLinkActive : ''}`}
              >
                All News
              </Link>
              <span className={styles.categoryCount}>{articles.length}</span>
            </li>
            {categories.map((cat) => (
              <li key={cat.name} className={styles.categoryItem}>
                <Link
                  href={`/news?category=${encodeURIComponent(cat.name)}`}
                  className={`${styles.categoryLink} ${currentCategory === cat.name ? styles.categoryLinkActive : ''}`}
                >
                  {cat.name}
                </Link>
                <span className={styles.categoryCount}>{cat.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Recent News</h3>
          <div className={styles.recentList}>
            {recentArticles.map((a) => (
              <div key={a.id} className={styles.recentItem}>
                <Link href={`/news/${a.slug}`} className={styles.recentTitle}>
                  {a.title}
                </Link>
                <span className={styles.recentDate}>
                  {formatDate(a.publishedAt || a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tag Cloud */}
      {topTags.length > 0 && (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Popular Topics</h3>
          <div className={styles.tagCloud}>
            {topTags.map((tag) => (
              <Link
                key={tag}
                href={`/news?tag=${encodeURIComponent(tag)}`}
                className={styles.tag}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
