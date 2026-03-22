import styles from './SkillReview.module.css';

export type SkillReviewCheck = {
  label: string;
  status: 'pass' | 'pending';
  detail: string;
};

type SkillReviewProps = {
  title?: string;
  checks: SkillReviewCheck[];
  note?: string;
};

export function SkillReview({ title = 'UI Skill Review', checks, note }: SkillReviewProps) {
  return (
    <aside className={styles.review} aria-label={title}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>ui-ux-design auto review</p>
        <h3>{title}</h3>
      </div>
      <ul className={styles.list}>
        {checks.map((check) => (
          <li key={check.label} className={styles.item}>
            <span className={`${styles.badge} ${check.status === 'pass' ? styles.pass : styles.pending}`.trim()}>
              {check.status === 'pass' ? 'Pass' : 'Pending'}
            </span>
            <div>
              <strong>{check.label}</strong>
              <p>{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      {note ? <p className={styles.note}>{note}</p> : null}
    </aside>
  );
}
