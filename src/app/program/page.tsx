import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Student Program",
  description:
    "The SOF Student Analyst Program puts students inside a live quantitative investment process before their careers begin.",
  path: "/program",
});

export default function ProgramPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-40 right-10 h-[500px] w-[500px] rounded-full bg-copper/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-signal/5 blur-3xl" />
        </div>
        <Container className="relative">
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Student Analyst Program
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Build what&apos;s next in finance
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            SOF puts students inside a live quantitative investment process
            before their careers begin. Real work product, real capital
            consequences, under a CIO whose research has shaped the field.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Button href="/team" variant="outline">
              <span className="text-cloud">Meet the cohort</span>
            </Button>
          </div>
        </Container>
      </section>

      {/* Quick stats */}
      <section className="border-b border-border/60 bg-cloud py-14">
        <Container>
          <div className="grid grid-cols-3 gap-8">
            <Stat label="Cohort Size" value="11" />
            <Stat label="Selection Stages" value="3" />
            <Stat label="Term Length" value="Multi-Semester" />
          </div>
        </Container>
      </section>

      {/* What Students Do */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Program
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">What students do</h2>
            </div>
            <div>
              <p className="text-[17px] leading-[1.8] text-foreground-secondary">
                The fund&apos;s quantitative model surfaces special situation
                candidates. The student team takes it from there. They conduct
                company-level research, stress-test the analytical case among
                themselves, and deliver a collective investment memo to the
                Chief Investment Officer.
              </p>
              <div className="mt-16 space-y-12">
                {[
                  {
                    title: "Candidate Analysis",
                    text: "Build a collective investment case on each screened candidate. Conclusions are challenged internally before they reach the CIO. The standard is whether the work is fit to inform a real capital decision.",
                  },
                  {
                    title: "Position Monitoring",
                    text: "When the model flags drift or a material event occurs, the team investigates and delivers a position update to the CIO within 24 hours.",
                  },
                  {
                    title: "Quarterly Reporting",
                    text: "Students produce the analytical inputs for LP reporting, a direct line of accountability from their work product to the people whose capital is deployed.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="border-l-2 border-copper/40 pl-8"
                  >
                    <h3 className="font-heading text-xl">{item.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Selection Process */}
      <section className="border-t border-border/60 bg-cloud py-16 sm:py-24">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            How We Select
          </p>
          <h2 className="mt-6 text-4xl sm:text-5xl">Selection process</h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.8] text-foreground-muted">
            A 3-stage interview flow with cuts at each progression.
          </p>
          <div className="mt-16 grid gap-px bg-border/60 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Behavioral Interview",
                duration: "15 min",
                text: "A conversation assessing fit with the team and intellectual curiosity.",
              },
              {
                step: "02",
                title: "Quantitative Case Study",
                duration: "1 week",
                text: "A written memo and model on a pre-selected public equity situation, submitted for review.",
              },
              {
                step: "03",
                title: "Thesis Defense",
                duration: "60 min",
                text: "Present your analysis to the fund and defend your thesis under direct questioning. Dr. Brogaard makes the final selection.",
              },
            ].map((stage) => (
              <div key={stage.step} className="bg-background p-10 sm:p-12">
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-3xl text-copper/60">
                    {stage.step}
                  </span>
                  <span className="text-[11px] font-medium tracking-[0.15em] text-foreground-muted uppercase">
                    {stage.duration}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-xl">{stage.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-foreground-muted">
                  {stage.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How responsibility grows */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Growth
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">
                How responsibility grows
              </h2>
              <p className="mt-6 text-[17px] leading-[1.8] text-foreground-muted">
                SOF runs a flat Analyst cohort. Scope expands with judgment,
                not title.
              </p>
            </div>
            <div>
              <div className="grid gap-px bg-border/60 sm:grid-cols-3">
                {[
                  {
                    phase: "First Semester",
                    text: "Learn the model methodology, shadow live screening, and contribute to collective memos under supervision.",
                  },
                  {
                    phase: "Returning Analyst",
                    text: "Own candidate memos end-to-end. Position monitoring, event-driven updates, and direct input into LP reporting.",
                  },
                  {
                    phase: "Senior Cohort",
                    text: "Co-lead model development, mentor new analysts, and run internal review sessions before memos reach the CIO.",
                  },
                ].map((phase, i) => (
                  <div key={phase.phase} className="bg-background p-10 sm:p-12">
                    <span className="text-[11px] font-medium tracking-[0.15em] text-copper uppercase">
                      Phase {i + 1}
                    </span>
                    <h3 className="mt-4 font-heading text-xl">{phase.phase}</h3>
                    <p className="mt-4 text-[15px] leading-relaxed text-foreground-muted">
                      {phase.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Who We Recruit + Career Outcomes */}
      <section className="bg-ink py-16 sm:py-24">
        <Container>
          <div className="grid gap-24 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Who We Recruit
              </p>
              <h2 className="mt-6 text-4xl text-cloud sm:text-5xl">
                Depth over pedigree
              </h2>
              <p className="mt-8 text-[17px] leading-[1.8] text-foreground-on-dark-muted">
                SOF draws from the University of Utah and maintains a steady
                cohort of student analysts. New analysts are admitted each
                semester to backfill natural attrition, ensuring continuity of
                model ownership and institutional knowledge across cohort
                generations.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Career Outcomes
              </p>
              <h2 className="mt-6 text-4xl text-cloud sm:text-5xl">
                Where analysts go
              </h2>
              <p className="mt-8 text-[17px] leading-[1.8] text-foreground-on-dark-muted">
                By the end of their time with SOF, analysts are prepared for
                and actively supported in pursuing careers with investment
                banks, management consulting firms, private equity funds, and
                hedge funds across top firms in the nation. Dr. Brogaard&apos;s
                network spans the institutional investment community.
              </p>
            </div>
          </div>
          <div className="mt-16 flex flex-wrap items-center gap-5">
            <Button href="/team" variant="outline">
              <span className="text-cloud">Meet the cohort</span>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-lg text-ink sm:text-xl">{value}</p>
    </div>
  );
}
