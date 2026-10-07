import type { ReactNode } from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import styles from './Signal.module.css';

/**
 * Sections shared between the homepage and the /approach and /process pages.
 * The homepage carries the short version of each and links out; the pages
 * carry the whole telling, so the brain's destinations are real pages.
 */

export function PageHeadline({ kicker, title, children }: { kicker: string; title: ReactNode; children: ReactNode }) {
  return <section className={`${styles.section} ${styles.headline} ${styles.pageHeadline}`}><div className={`${styles.grid} ${styles.headlineGrid}`}>
    <div><p className={styles.kicker}><span className={styles.rule} />{kicker}</p><h1>{title}</h1></div>
    <div><p>{children}</p></div>
  </div></section>;
}

export function ApproachSection({ full = false }: { full?: boolean }) {
  return <section id="approach" className={`${styles.section} ${styles.approach}`}><div className={styles.grid}>
    <Reveal><p className={styles.kicker}>Our approach</p><h2>Several strategies, <em>one shared process.</em></h2></Reveal>
    <Reveal className={styles.prose}>
      <p className={styles.lead}>{full
        ? <>We run several independent strategies. Each one looks for a specific, repeatable inefficiency in stock prices, often in smaller companies that most of the market doesn&apos;t cover closely.</>
        : <>Each strategy targets one repeatable inefficiency in stock prices, often in smaller companies.</>}</p>
      {full ? <>
        <p>Each strategy is built and tested by a small team of analysts. Before it trades, someone outside that team reviews the work and looks for what&apos;s wrong with it.</p>
        <p>All strategies run through one shared trading and risk system, so every trade goes through the same checks and is recorded the same way.</p>
        <Link className={styles.textLink} href="/process"><span>Follow the process</span> →</Link>
      </> : <Link className={styles.textLink} href="/approach"><span>Read the full approach</span> →</Link>}
    </Reveal>
  </div></section>;
}

export function FundStructureSection() {
  return <section id="fund-structure" className={styles.section}><div className={styles.grid}>
    <Reveal><p className={styles.kicker}>Fund structure</p><h2>Independently <em>operated</em></h2></Reveal>
    <Reveal className={styles.prose}>
      <p>Scholars Opportunity Fund is independently operated. Students run the research, and experienced leadership oversees every strategy that trades.</p>
      <p>We keep a written record of every strategy, from the first idea to how it performed, including the ones we stopped.</p>
    </Reveal>
  </div></section>;
}

/** The homepage's short telling of the pipeline: the four stages and a way out to the full rail. */
