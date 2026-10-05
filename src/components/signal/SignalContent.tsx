import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { CIO } from '@/lib/team';
import { FUND } from '@/lib/constants';
import SignalField from './SignalField';
import { ApproachSection, ProcessTeaser } from './SignalSections';
import styles from './Signal.module.css';

export default function SignalContent() {
  return <div className={styles.content}>
    <section id="sof-overview" className={`${styles.section} ${styles.headline}`}><SignalField /><div className={`${styles.grid} ${styles.headlineGrid}`}>
      <div><p className={styles.kicker}><span className={styles.rule} />Est. {FUND.foundedYear}</p><h1>Systematic strategies in <em>public equities</em>.</h1></div>
      <div><p>We&apos;re a student-run fund led by {CIO.name}. Our analysts build and test systematic strategies in U.S. stocks. Much of the work focuses on smaller companies and on events like mergers and spin-offs.</p><div className={styles.actions}><Link className={styles.button} href="/approach">Read the approach →</Link><Link className={styles.outline} href="/team">Meet the team</Link></div></div>
    </div></section>
    {/* The homepage carries the short version of each; the full telling lives on /approach and /process. */}
    <ApproachSection />
    <ProcessTeaser />
    <section id="leadership" className={styles.section}><div className={`${styles.grid} ${styles.leadership}`}>
      <Reveal className={styles.portrait}><div><Image src={CIO.image} alt={CIO.name} fill sizes="(min-width:1024px) 400px, 80vw" className="object-cover" /></div><div className={styles.nameplate}><p>{CIO.name}</p><span>{CIO.role}</span></div></Reveal>
      <Reveal><p className={styles.kicker}>Leadership</p><h2>Led by Dr. Jonathan Brogaard</h2><p className={styles.bio}>Associate Dean of Research and Kendall D. Garff Chaired Professor of Finance. Published in the Journal of Finance, Journal of Financial Economics and Review of Financial Studies. Member of FINRA&apos;s Market Regulation Committee.</p><div className={styles.credentials}>{[['JF · JFE · RFS', 'Published'], ['FINRA', 'Market Regulation Committee'], ['2023', 'Founded IAIM']].map(([title, label]) => <div key={title}><p>{title}</p><span>{label}</span></div>)}</div><Link href="/team" className={styles.textLink}><span>Full biography</span> →</Link></Reveal>
    </div></section>
    <section className={`${styles.section} ${styles.analysts}`}><svg aria-hidden="true" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none"><path d="M0 130 L200 118 L360 126 L520 84 L700 100 L880 50 L1040 70 L1240 20 L1440 40" stroke="#A0755A" strokeWidth="1.5" /><path d="M0 150 L240 144 L480 148 L720 130 L960 136 L1200 112 L1440 118" stroke="#7BB8D6" /></svg><div className={`${styles.grid} ${styles.analystGrid}`}><div><p className={styles.kicker}>Student analyst program</p><h2>Analysts build the strategies</h2><p className={styles.bio}>Analysts own the research behind each strategy. They come up with ideas, test them on historical data, defend them in review, and track how they perform once they trade. Students from any university can apply when applications are open.</p></div><div className={styles.analystActions}><Link className={styles.button} href="/program">How we work →</Link><Link className={styles.outline} href="/team">Meet the team</Link></div></div></section>
  </div>;
}
