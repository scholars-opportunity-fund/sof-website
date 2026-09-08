import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { CIO } from '@/lib/team';
import { FUND } from '@/lib/constants';
import SignalField from './SignalField';
import SignalProcess from './SignalProcess';
import styles from './Signal.module.css';

const catalysts = ['Spin-offs', 'Mergers & acquisitions', 'Restructurings', 'Index changes', 'Activist campaigns', 'Post-bankruptcy equities', 'Tender offers', 'Special dividends', 'Management transitions', 'Regulatory catalysts'];

export default function SignalContent() {
  return <div className={styles.content}>
    <section id="sof-overview" className={`${styles.section} ${styles.headline}`}><SignalField /><div className={`${styles.grid} ${styles.headlineGrid}`}>
      <div><p className={styles.kicker}><span className={styles.rule} />Est. {FUND.foundedYear}</p><h1>Where the event <em>is</em> the edge.</h1></div>
      <div><p>A student-run, event-driven fund in public equities. We underwrite special situations where a defined catalyst reshapes risk and reward, led by {CIO.name}.</p><div className={styles.actions}><Link className={styles.button} href="/about">Read the approach →</Link><Link className={styles.outline} href="/team">Meet the cohort</Link></div></div>
    </div></section>
    <div className={styles.ticker} aria-label="Event-driven opportunities"><div>{[0, 1].map(copy => <div key={copy} aria-hidden={copy === 1}>{catalysts.map(item => <span key={item}>{item}<i /></span>)}</div>)}</div></div>
    <section id="approach" className={`${styles.section} ${styles.approach}`}><div className={styles.grid}>
      <Reveal><p className={styles.kicker}>Our approach</p><h2>Event-driven.<br />Catalyst-focused.<br /><em>Selective.</em></h2></Reveal>
      <Reveal className={styles.prose}><p className={styles.lead}>We look for situations where a defined event reshapes the risk-reward and institutional coverage is thin.</p><p>Sourcing, screening and diligence feed a structured investment memo, pressure-tested by the analyst team before it reaches the investment committee.</p><p>The Chief Investment Officer owns every capital decision. Positions are monitored continuously against the original thesis, and every step from idea to outcome is documented and auditable.</p><Link className={styles.textLink} href="/about"><span>Read the full overview</span> →</Link></Reveal>
    </div></section>
    <SignalProcess />
    <section id="leadership" className={styles.section}><div className={`${styles.grid} ${styles.leadership}`}>
      <Reveal className={styles.portrait}><div><Image src={CIO.image} alt={CIO.name} fill sizes="(min-width:1024px) 400px, 80vw" className="object-cover" /></div><div className={styles.nameplate}><p>{CIO.name}</p><span>{CIO.role}</span></div></Reveal>
      <Reveal><p className={styles.kicker}>Leadership</p><h2>A CIO whose research shaped the field</h2><p className={styles.bio}>Associate Dean of Research and Kendall D. Garff Chaired Professor at the University of Utah&apos;s David Eccles School of Business. Published in the Journal of Finance, Journal of Financial Economics and Review of Financial Studies. Member of FINRA&apos;s Market Regulation Committee. Founder of the Institute for Advanced Investment Management (2023).</p><div className={styles.credentials}>{[['JF · JFE · RFS', 'Published'], ['FINRA', 'Market Regulation Committee'], ['2023', 'Founded IAIM']].map(([title, label]) => <div key={title}><p>{title}</p><span>{label}</span></div>)}</div><Link href="/team" className={styles.textLink}><span>Full biography</span> →</Link></Reveal>
    </div></section>
    <section className={`${styles.section} ${styles.analysts}`}><svg aria-hidden="true" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none"><path d="M0 130 L200 118 L360 126 L520 84 L700 100 L880 50 L1040 70 L1240 20 L1440 40" stroke="#A0755A" strokeWidth="1.5" /><path d="M0 150 L240 144 L480 148 L720 130 L960 136 L1200 112 L1440 118" stroke="#7BB8D6" /></svg><div className={`${styles.grid} ${styles.analystGrid}`}><div><p className={styles.kicker}>Student analyst program</p><h2>Build what&apos;s next in finance</h2><p className={styles.bio}>Analysts sit inside a live event-driven process: real work product, up to 12 hours a week, multiple semesters. Scope expands with judgment, not title. New analysts are admitted each semester from the University of Utah.</p></div><div className={styles.analystActions}><Link className={styles.button} href="/program">How we work →</Link><Link className={styles.outline} href="/team">Meet the cohort</Link></div></div></section>
  </div>;
}
