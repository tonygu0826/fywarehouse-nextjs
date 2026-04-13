import Link from 'next/link';
import { NewsCard } from './NewsCard';
import type { NewsArticleSummary } from '@/lib/news';
import styles from './NewsList.module.css';

type Props = {
  articles: NewsArticleSummary[];
  page: number;
  totalCount: number;
  pageSize: number;
};

export function NewsList({ articles, page, totalCount, pageSize }: Props) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (articles.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No news articles yet. Check back soon for the latest industry updates.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.list}>
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {page > 1 && (
            <Link href={`/news?page=${page - 1}`} className={styles.pageBtn}>
              Previous
            </Link>
          )}
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/news?page=${page + 1}`} className={styles.pageBtn}>
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
