import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Student Program",
  description:
    "The SOF Student Analyst Program puts students inside a live quantitative investment process before their careers begin. Apply to join the next cohort.",
  path: "/program",
});

export default function ProgramPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-36 sm:py-44">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Student Analyst Program
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Build what&apos;s next in finance
          </h1>
          <p className="mt-8 max-w-xl text-[17px] text-foreground-on-dark-muted leading-[1.8]">
            SOF puts students inside a live quantitative investment process
            before their careers begin. Real work product, real capital
            consequences, under a CIO whose research has shaped the field.
          </p>
          <div className="mt-12">
            <Button href="/apply">Apply Now</Button>
          </div>
        </Container>
      </section>

      {/* What Students Do */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="text-4xl sm:text-5xl">What students do</h2>
            </div>
            <div>
              <p className="text-[17px] text-foreground-secondary leading-[1.8]">
                The fund&apos;s quantitative model surfaces special situation
                candidates. The student team takes it from there — conducting
                company-level research, stress-testing the analytical case
                among themselves, and delivering a collective investment memo
                to the CIO. He makes every investment decision.
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
                    text: "Students produce the analytical inputs for LP reporting — a direct line of accountability from their work product to the people whose capital is deployed.",
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 border-copper/40 pl-8">
                    <h3 className="font-heading text-xl">{item.title}</h3>
                    <p className="mt-3 text-[15px] text-foreground-muted leading-relaxed">
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
      <section className="border-t border-border/60 py-32 sm:py-40">
        <Container>
          <h2 className="text-4xl sm:text-5xl">Selection process</h2>
          <p className="mt-6 max-w-xl text-[17px] text-foreground-muted leading-[1.8]">
            A 3-stage interview flow with cuts at each progression.
          </p>
          <div className="mt-16 grid gap-px bg-border/60 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Behavioral Interview",
                text: "A 15-minute conversation assessing fit with the team and intellectual curiosity.",
              },
              {
                step: "02",
                title: "Quantitative Case Study",
                text: "A one-week written memo and model on a pre-selected public equity situation, submitted for review.",
              },
              {
                step: "03",
                title: "Thesis Defense",
                text: "Present your analysis to the fund and defend your thesis under direct questioning. Dr. Brogaard makes the final selection.",
              },
            ].map((stage) => (
              <div key={stage.step} className="bg-background p-10 sm:p-12">
                <span className="text-3xl font-heading text-copper/60">
                  {stage.step}
                </span>
                <h3 className="mt-6 font-heading text-xl">{stage.title}</h3>
                <p className="mt-4 text-[15px] text-foreground-muted leading-relaxed">
                  {stage.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Role Progression */}
      <section className="py-32 sm:py-40">
        <Container>
          <h2 className="text-4xl sm:text-5xl">Role progression</h2>
          <p className="mt-6 max-w-xl text-[17px] text-foreground-muted leading-[1.8]">
            Responsibility scales with tenure across defined roles.
          </p>
          <div className="mt-16 grid gap-px bg-border/60 sm:grid-cols-3">
            {[
              {
                title: "Analyst",
                text: "New cohort members begin as Analysts, learning the model methodology and participating in supervised live screening.",
              },
              {
                title: "Associate",
                text: "Associates take independent responsibility for candidate memos, position monitoring, and reporting deliverables.",
              },
              {
                title: "Senior Associate",
                text: "Senior Associates co-lead model development, mentor incoming cohort members, and oversee analyst output quality.",
              },
            ].map((role) => (
              <div key={role.title} className="bg-background p-10 sm:p-12">
                <h3 className="font-heading text-xl">{role.title}</h3>
                <p className="mt-4 text-[15px] text-foreground-muted leading-relaxed">
                  {role.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who We Recruit + Career Outcomes */}
      <section className="bg-ink py-32 sm:py-40">
        <Container>
          <div className="grid gap-24 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl text-cloud sm:text-5xl">Who we recruit</h2>
              <p className="mt-8 text-[17px] text-foreground-on-dark-muted leading-[1.8]">
                SOF does not draw from a single institution or pipeline. The
                program maintains a steady cohort of 12 to 16 students. New
                analysts are admitted each semester to backfill natural
                attrition, ensuring continuity of model ownership and
                institutional knowledge across cohort generations.
              </p>
            </div>
            <div>
              <h2 className="text-4xl text-cloud sm:text-5xl">Career outcomes</h2>
              <p className="mt-8 text-[17px] text-foreground-on-dark-muted leading-[1.8]">
                By the end of their time with SOF, analysts are prepared for
                and actively supported in pursuing careers with investment
                banks, management consulting firms, private equity funds, and
                hedge funds across top firms in the nation. Dr. Brogaard&apos;s
                network spans the institutional investment community.
              </p>
            </div>
          </div>
          <div className="mt-16">
            <Button href="/apply">Apply Now</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
