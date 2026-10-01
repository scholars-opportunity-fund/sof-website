import { ApproachSection, FundStructureSection, PageHeadline } from '@/components/signal/SignalSections';
import styles from '@/components/signal/Signal.module.css';
import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Our Approach',
  description:
    'How Scholars Opportunity Fund finds event-driven special situations in public equities, and how the fund is independently operated.',
  path: '/approach',
});

export default function ApproachPage() {
  return <div className={styles.content}>
    <PageHeadline kicker="How we invest" title={<>Catalysts, special situations, <em>uneven coverage</em>.</>}>
      We underwrite special situations where a defined catalyst reshapes risk and reward, in corners of the public equity market that institutional coverage leaves thin.
    </PageHeadline>
    <ApproachSection full />
    <FundStructureSection />
  </div>;
}
