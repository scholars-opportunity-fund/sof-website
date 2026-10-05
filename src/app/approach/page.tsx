import { ApproachSection, FundStructureSection, PageHeadline } from '@/components/signal/SignalSections';
import styles from '@/components/signal/Signal.module.css';
import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Our Approach',
  description:
    'How Scholars Opportunity Fund builds systematic strategies in public equities, and how the fund is run.',
  path: '/approach',
});

export default function ApproachPage() {
  return <div className={styles.content}>
    <PageHeadline kicker="How we invest" title={<>Systematic strategies, <em>tested before they trade</em>.</>}>
      We build rules-based strategies in U.S. public equities, with a focus on smaller companies where institutional coverage is thin. Event-driven special situations, like mergers, spin-offs and index changes, are one of the areas we work in.
    </PageHeadline>
    <ApproachSection full />
    <FundStructureSection />
  </div>;
}
