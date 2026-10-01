import type { ReactNode } from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { PROCESS_STEPS } from './process-steps';
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
    <Reveal><p className={styles.kicker}>Our approach</p><h2>Event-driven.<br />Catalyst-focused.<br /><em>Selective.</em></h2></Reveal>
    <Reveal className={styles.prose}>
      <p className={styles.lead}>We look for situations where a defined event reshapes the risk-reward and institutional coverage is thin.</p>
      {full ? <>
        <p>Sourcing, screening and diligence feed a structured investment memo, pressure-tested by the analyst team before it reaches the investment committee.</p>
        <p>The Chief Investment Officer owns every capital decision. Positions are monitored continuously against the original thesis, and every step from idea to outcome is documented and auditable.</p>
        <Link className={styles.textLink} href="/process"><span>Follow the process</span> →</Link>
      </> : <Link className={styles.textLink} href="/approach"><span>Read the full approach</span> →</Link>}
    </Reveal>
  </div></section>;
}

export function FundStructureSection() {
  return <section id="fund-structure" className={styles.section}><div className={styles.grid}>
    <Reveal><p className={styles.kicker}>Fund structure</p><h2>Independently <em>operated</em></h2></Reveal>
    <Reveal className={styles.prose}>
      <p>Scholars Opportunity Fund is independently operated. The fund combines experienced GP oversight with a structured student analyst program that produces institutional-grade analytical throughput and exceptional talent development.</p>
      <p>The structural parallel to established student-run investment programs is direct: independent operation, student analysts at the center, experienced leadership making every capital decision.</p>
      <p>Every step from idea to investment outcome is documented and auditable. Process integrity drives performance.</p>
    </Reveal>
  </div></section>;
}

/** The homepage's short telling of the pipeline: the four stages and a way out to the full rail. */
export function ProcessTeaser() {
  return <section id="pipeline" className={`${styles.section} ${styles.process}`}><div className={styles.grid}>
    <Reveal><p className={styles.kicker}>Investment process</p><h2>From sourcing to decision</h2><p className={styles.muted}>A disciplined pipeline with clear accountability at every stage.</p></Reveal>
    <Reveal className={styles.prose}>
      <ol className={styles.stageList}>{PROCESS_STEPS.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.meta}</p></div></li>)}</ol>
      <Link className={styles.textLink} href="/process"><span>Follow the process</span> →</Link>
    </Reveal>
  </div></section>;
}
