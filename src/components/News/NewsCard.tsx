import Image from 'next/image';
import Link from 'next/link';
import type { NewsArticleSummary } from '@/lib/news';
import styles from './NewsCard.module.css';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Deterministic color based on category name for placeholder images */
const categoryColors: Record<string, string> = {
  'Industry News': '#0f3d91',
  'Company Updates': '#0d47a1',
  'Logistics': '#1565c0',
  'Customs': '#0277bd',
  'Supply Chain': '#00838f',
  'Warehousing': '#00695c',
};

function getCategoryColor(category: string): string {
  if (categoryColors[category]) return categoryColors[category];
  // Fallback: generate a color from the category string
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 35%)`;
}

export function NewsCard({ article }: { article: NewsArticleSummary }) {
  const date = article.publishedAt || article.createdAt;

  return (
    <article className={styles.card}>
      {article.featuredImage ? (
        <div className={styles.imageWrapper}>
          <Image
            src={article.featuredImage}
            alt={article.featuredImageAlt || `${article.title} - ${article.category}`}
            className={styles.image}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      ) : (
        <div
          className={`${styles.imageWrapper} ${styles.placeholder}`}
          style={{ backgroundColor: getCategoryColor(article.category) }}
          role="img"
          aria-label={`${article.category} article`}
        >
          <span className={styles.placeholderText}>{article.category}</span>
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{article.category}</span>
          <span className={styles.dot} />
          <time dateTime={date}>{formatDate(date)}</time>
        </div>
        <h3 className={styles.title}>
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <div className={styles.footer}>
          <span>{article.readingTimeMinutes} min read</span>
          <span className={styles.dot} />
          <span>{article.author}</span>
        </div>
      </div>
    </article>
  );
}
