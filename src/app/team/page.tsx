import Image from "next/image";
import Container from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/seo";
import { CIO, GPS, ANALYSTS, type TeamMember } from "@/lib/team";

export const metadata = generatePageMetadata({
  title: "Our Team",
  description:
    "Meet the Scholar Opportunity Fund team. Led by Dr. Jonathan Brogaard, with a rigorously selected cohort of student analysts from the University of Utah.",
  path: "/team",
});

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-36 sm:py-44">
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
            trajectory.
          </p>
        </Container>
      </section>

      {/* CIO */}
      <section className="py-28 sm:py-36">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Chief Investment Officer
          </p>
          <div className="mt-10 grid items-start gap-12 lg:grid-cols-[360px_1fr] lg:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden bg-gunmetal/10">
              <Image
                src={CIO.image}
                alt={`${CIO.name}, ${CIO.role}`}
                fill
                sizes="(min-width: 1024px) 360px, 90vw"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl">{CIO.name}</h2>
              <p className="mt-3 text-[14px] font-medium tracking-[0.15em] text-copper uppercase">
                {CIO.role}
              </p>
              {CIO.credentials && (
                <p className="mt-2 text-[14px] text-foreground-muted">
                  {CIO.credentials}
                </p>
              )}
              <div className="mt-8 h-px w-16 bg-copper" />
              {CIO.bio && (
                <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-secondary">
                  {CIO.bio}
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Co-Founder, Head of Research & Operations */}
      <section className="border-t border-border/60 bg-cloud py-28 sm:py-36">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Co-Founder
          </p>
          <div className="mt-10 space-y-16">
            {GPS.map((gp) => (
              <div
                key={gp.slug}
                className="grid items-start gap-12 lg:grid-cols-[300px_1fr] lg:gap-20"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gunmetal/10">
                  <Image
                    src={gp.image}
                    alt={`${gp.name}, ${gp.role}`}
                    fill
                    sizes="(min-width: 1024px) 300px, 90vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-4xl sm:text-5xl">{gp.name}</h2>
                  <p className="mt-3 text-[14px] font-medium tracking-[0.15em] text-copper uppercase">
                    {gp.role}
                  </p>
                  {gp.credentials && (
                    <p className="mt-2 text-[14px] text-foreground-muted">
                      {gp.credentials}
                    </p>
                  )}
                  <div className="mt-8 h-px w-16 bg-copper" />
                  <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-secondary">
                    {gp.bio ?? gp.headline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Analyst cohort */}
      <section className="border-t border-border/60 py-28 sm:py-36">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Analyst Cohort
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">The cohort</h2>
            </div>
            <p className="max-w-xl text-[17px] leading-[1.8] text-foreground-muted">
              Scholar Opportunity Fund maintains a steady cohort of student
              analysts drawn from the University of Utah. Analysts own
              candidate research, stress-test one another&apos;s work, and
              deliver collective investment memos to the CIO.
            </p>
          </div>

          <div className="mt-14 border-t border-border/60 pt-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-heading text-2xl">Analysts</h3>
              <span className="text-[13px] font-medium tracking-[0.15em] text-foreground-muted uppercase">
                {ANALYSTS.length} members
              </span>
            </div>
            <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ANALYSTS.map((m) => (
                <MemberCard key={m.slug} member={m} />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden bg-gunmetal/10">
        <Image
          src={member.image}
          alt={`${member.name}, ${member.role}`}
          fill
          sizes="(min-width: 1280px) 260px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-4">
        <h4 className="font-heading text-lg text-ink">{member.name}</h4>
        <p className="mt-1 text-[11px] font-medium tracking-[0.15em] text-copper uppercase">
          {member.role}
        </p>
        {member.credentials && (
          <p className="mt-2 text-[12px] leading-snug text-foreground-muted">
            {member.credentials}
          </p>
        )}
        <p className="mt-2 text-[13px] leading-snug text-foreground-secondary">
          {member.headline}
        </p>
      </div>
    </article>
  );
}
