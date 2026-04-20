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
          <div className="mt-16 grid max-w-xl grid-cols-3 gap-px bg-gunmetal/60">
            <Stat label="Cohort" value={String(ANALYSTS.length)} />
            <Stat
              label="4.0 GPAs"
              value={String(
                ANALYSTS.filter((a) =>
                  (a.credentials ?? "").includes("4.00")
                ).length
              )}
            />
            <Stat label="Institution" value="Utah" />
          </div>
        </Container>
      </section>

      {/* CIO */}
      <section className="py-32 sm:py-40">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Chief Investment Officer
          </p>
          <div className="mt-10 grid items-start gap-16 lg:grid-cols-[360px_1fr] lg:gap-24">
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

      {/* General Partner(s) — co-founders, oversee the cohort */}
      <section className="border-t border-border/60 bg-cloud py-32 sm:py-40">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            General Partner
          </p>
          <div className="mt-10 space-y-20">
            {GPS.map((gp) => (
              <div
                key={gp.slug}
                className="grid items-start gap-16 lg:grid-cols-[300px_1fr] lg:gap-24"
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

      {/* Analyst cohort — flat */}
      <section className="border-t border-border/60 py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
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

          <div className="mt-16 border-t border-border/60 pt-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-heading text-2xl">Analysts</h3>
              <span className="text-[13px] font-medium tracking-[0.15em] text-foreground-muted uppercase">
                {ANALYSTS.length} members
              </span>
            </div>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-5">
        <h4 className="font-heading text-xl text-ink">{member.name}</h4>
        <p className="mt-1 text-[12px] font-medium tracking-[0.15em] text-copper uppercase">
          {member.role}
        </p>
        {member.credentials && (
          <p className="mt-3 text-[13px] leading-relaxed text-foreground-muted">
            {member.credentials}
          </p>
        )}
        <p className="mt-3 text-[14px] leading-relaxed text-foreground-secondary">
          {member.headline}
        </p>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink p-6">
      <p className="font-heading text-3xl text-cloud sm:text-4xl">{value}</p>
      <p className="mt-2 text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
        {label}
      </p>
    </div>
  );
}
