import Link from 'next/link';
import type { NewsArticle as NewsArticleType, NewsArticleSummary } from '@/lib/news';
import { NewsCard } from './NewsCard';
import styles from './NewsArticle.module.css';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type Props = {
  article: NewsArticleType;
  relatedNews: NewsArticleSummary[];
};

export function NewsArticle({ article, relatedNews }: Props) {
  const date = article.publishedAt || article.createdAt;

  return (
    <article className={styles.article}>
      <div className={styles.header}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.separator}>/</span>
          <Link href="/news">News</Link>
          <span className={styles.separator}>/</span>
          <span>{article.title}</span>
        </nav>

        <div className={styles.meta}>
          <span className={styles.category}>{article.category}</span>
          <span className={styles.dot} />
          <time dateTime={date}>{formatDate(date)}</time>
          <span className={styles.dot} />
          <span>{article.readingTimeMinutes} min read</span>
        </div>

        <h1 className={styles.title}>{article.title}</h1>
      </div>

      {article.featuredImage && (
        <img
          src={article.featuredImage}
          alt={article.featuredImageAlt || `${article.title} - ${article.category} | FENGYE LOGISTICS`}
          className={styles.featuredImage}
          loading="eager"
        />
      )}

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.tags.length > 0 && (
        <div className={styles.tags}>
          {article.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      {relatedNews.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Related News</h2>
          {relatedNews.map((related) => (
            <NewsCard key={related.id} article={related} />
          ))}
        </section>
      )}
    </article>
  );
}
