import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Student Program",
  description:
    "The SOF Student Analyst Program puts students inside a live quantitative investment process before their careers begin. Apply to join the next cohort.",
  path: "/program",
});

const interviewStages = [
  {
    step: "01",
    title: "Behavioral Interview",
    description:
      "A 15-minute conversation assessing fit with the team and intellectual curiosity.",
  },
  {
    step: "02",
    title: "Quantitative Case Study",
    description:
      "A one-week written memo and model on a pre-selected public equity situation, submitted for review.",
  },
  {
    step: "03",
    title: "Thesis Defense",
    description:
      "Present your analysis to the fund and defend your thesis under direct questioning. Dr. Brogaard makes the final selection.",
  },
];

const roles = [
  {
    title: "Analyst",
    description:
      "New cohort members begin as Analysts, learning the model methodology and participating in supervised live screening.",
  },
  {
    title: "Associate",
    description:
      "Associates take independent responsibility for candidate memos, position monitoring, and reporting deliverables.",
  },
  {
    title: "Senior Associate",
    description:
      "Senior Associates co-lead model development, mentor incoming cohort members, and oversee analyst output quality.",
  },
];

export default function ProgramPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-20 sm:py-28">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            Student Analyst Program
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-cloud sm:text-5xl font-heading">
            Build What&apos;s Next in Finance
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-on-dark-muted leading-relaxed">
            SOF puts students inside a live quantitative investment process
            before their careers begin. Real work product, real capital
            consequences, under a CIO whose research has shaped the field.
          </p>
          <div className="mt-10">
            <Button href="/apply">Apply Now</Button>
          </div>
        </Container>
      </section>

      {/* What Students Do */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Students Do
            </h2>
            <div className="mt-8 space-y-6 text-foreground-secondary leading-relaxed">
              <p>
                The fund&apos;s quantitative model surfaces special situation
                candidates. The student team takes it from there — conducting
                company-level research, stress-testing the analytical case
                among themselves, and delivering a collective investment memo
                to the CIO. He makes every investment decision.
              </p>
            </div>
            <div className="mt-12 space-y-8">
              <div className="border-l-2 border-copper pl-6">
                <h3 className="text-lg font-bold font-heading text-ink">
                  Candidate Analysis
                </h3>
                <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                  Build a collective investment case on each screened
                  candidate. Conclusions are challenged internally before they
                  reach the CIO. The standard is whether the work is fit to
                  inform a real capital decision.
                </p>
              </div>
              <div className="border-l-2 border-copper pl-6">
                <h3 className="text-lg font-bold font-heading text-ink">
                  Position Monitoring
                </h3>
                <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                  When the model flags drift or a material event occurs, the
                  team investigates and delivers a position update to the CIO
                  within 24 hours.
                </p>
              </div>
              <div className="border-l-2 border-copper pl-6">
                <h3 className="text-lg font-bold font-heading text-ink">
                  Quarterly Reporting
                </h3>
                <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                  Students produce the analytical inputs for LP reporting — a
                  direct line of accountability from their work product to the
                  people whose capital is deployed.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Interview Process */}
      <section className="bg-background-alt py-20 sm:py-24">
        <Container>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Selection Process
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-foreground-muted">
            A 3-stage interview flow with cuts at each progression.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {interviewStages.map((stage) => (
              <Card key={stage.step} variant="elevated">
                <span className="text-3xl font-bold text-copper font-heading">
                  {stage.step}
                </span>
                <h3 className="mt-4 text-lg font-bold font-heading text-ink">
                  {stage.title}
                </h3>
                <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                  {stage.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Role Progression */}
      <section className="py-20 sm:py-24">
        <Container>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Role Progression
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-foreground-muted">
            Responsibility scales with tenure across defined roles.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title} variant="elevated">
                <h3 className="text-lg font-bold font-heading text-ink">
                  {role.title}
                </h3>
                <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                  {role.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Cohort Info */}
      <section className="bg-ink py-20 sm:py-24">
        <Container className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-cloud sm:text-4xl font-heading">
            Who We Recruit
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-on-dark-muted leading-relaxed">
            SOF does not draw from a single institution or pipeline. The
            program maintains a steady cohort of 12 to 16 students. New
            analysts are admitted each semester to backfill natural attrition,
            ensuring continuity of model ownership and institutional knowledge
            across cohort generations.
          </p>
          <div className="mt-10">
            <Button href="/apply">Apply Now</Button>
          </div>
        </Container>
      </section>

      {/* Career Outcomes */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Career Outcomes
            </h2>
            <p className="mt-6 text-foreground-secondary leading-relaxed">
              By the end of their time with SOF, analysts are prepared for and
              actively supported in pursuing careers with investment banks,
              management consulting firms, private equity funds, and hedge
              funds across top firms in the nation. Dr. Brogaard&apos;s
              network spans the institutional investment community and is an
              active resource for student placement.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
