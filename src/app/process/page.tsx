import Link from 'next/link';
import SignalProcess from '@/components/signal/SignalProcess';
import { PageHeadline } from '@/components/signal/SignalSections';
import styles from '@/components/signal/Signal.module.css';
import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Investment Process',
  description:
    'How a strategy moves through Scholars Opportunity Fund: research, backtesting, independent review, and paper and live trading.',
  path: '/process',
});

export default function ProcessPage() {
  return <div className={styles.content}>
    <PageHeadline kicker="From idea to outcome" title={<>How an idea becomes <em>a strategy</em>.</>}>
      Every strategy follows the same path, from a first idea to live trading. Each step has an owner and a written record.
    </PageHeadline>
    <SignalProcess />
    <section className={`${styles.section} ${styles.analysts}`}><div className={`${styles.grid} ${styles.analystGrid}`}>
      <div><p className={styles.kicker}>Who does the work</p><h2>Analysts inside the process</h2><p className={styles.bio}>Student analysts do the research, build the strategies and monitor them once they trade.</p></div>
      <div className={styles.analystActions}><Link className={styles.button} href="/program">How the program works →</Link><Link className={styles.outline} href="/approach">Read the approach</Link></div>
    </div></section>
  </div>;
}
