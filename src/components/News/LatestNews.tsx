import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { listPublishedArticles, type NewsArticleSummary } from '@/lib/news';
import styles from './LatestNews.module.css';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export async function LatestNews() {
  const articles = await listPublishedArticles(3);

  if (articles.length === 0) return null;

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.header}>
          <h2 className={styles.title}>Latest Industry News</h2>
          <Link href="/news" className={styles.viewAll}>
            View all news →
          </Link>
        </div>
        <div className={styles.grid}>
          {articles.map((article) => (
            <article key={article.id} className={styles.card}>
              <div className={styles.cardBody}>
                <span className={styles.category}>{article.category}</span>
                <h3 className={styles.cardTitle}>
                  <Link href={`/news/${article.slug}`}>{article.title}</Link>
                </h3>
                <div className={styles.cardMeta}>
                  {formatDate(article.publishedAt || article.createdAt)}
                  {' · '}
                  {article.readingTimeMinutes} min read
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
