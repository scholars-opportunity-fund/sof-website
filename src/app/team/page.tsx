import Container from "@/components/ui/Container";
import TeamDirectory from "@/components/team/TeamDirectory";
import { generatePageMetadata } from "@/lib/seo";
import { CIO, GPS, ANALYSTS } from "@/lib/team";

export const metadata = generatePageMetadata({
  title: "Our Team",
  description:
    "Meet the Scholars Opportunity Fund team. Led by Dr. Jonathan Brogaard, with a rigorously selected cohort of student analysts from the University of Utah.",
  path: "/team",
});

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-24 sm:py-32">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Our Team
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            The people behind SOF
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            Experienced leadership, rigorous process, and a cohort of analysts
            selected for depth of technical preparation and professional
            trajectory. Click any headshot to view a full profile.
          </p>
        </Container>
      </section>

      <TeamDirectory cio={CIO} cofounders={GPS} analysts={ANALYSTS} />
    </>
  );
}
