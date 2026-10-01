import Link from 'next/link';
import SignalProcess from '@/components/signal/SignalProcess';
import { PageHeadline } from '@/components/signal/SignalSections';
import styles from '@/components/signal/Signal.module.css';
import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Investment Process',
  description:
    'How an idea moves through Scholars Opportunity Fund: sourcing, screening and diligence, the investment committee, and monitoring.',
  path: '/process',
});

export default function ProcessPage() {
  return <div className={styles.content}>
    <PageHeadline kicker="From idea to outcome" title={<>How an idea becomes <em>a position</em>.</>}>
      Every idea follows the same documented path, from the first catalyst on a candidate list to a monitored position, with clear accountability at every stage.
    </PageHeadline>
    <SignalProcess />
    <section className={`${styles.section} ${styles.analysts}`}><div className={`${styles.grid} ${styles.analystGrid}`}>
      <div><p className={styles.kicker}>Who does the work</p><h2>Analysts inside the process</h2><p className={styles.bio}>Student analysts source, diligence and monitor every position alongside the Chief Investment Officer, who owns each capital decision.</p></div>
      <div className={styles.analystActions}><Link className={styles.button} href="/program">How the program works →</Link><Link className={styles.outline} href="/approach">Read the approach</Link></div>
    </div></section>
  </div>;
}
