import Container from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "Scholars Opportunity Fund runs a quantitative investment process targeting special situations in public equities. Led by Dr. Jonathan Brogaard.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-36 sm:py-44">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            About the Fund
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Scholars Opportunity Fund
          </h1>
          <p className="mt-8 max-w-xl text-[17px] text-foreground-on-dark-muted leading-[1.8]">
            A quantitative investment process targeting special situations
            in the public equity universe, where institutional coverage is
            thinnest and pricing inefficiency is highest.
          </p>
        </Container>
      </section>

      {/* Investment Process */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="text-4xl sm:text-5xl">Investment Process</h2>
            </div>
            <div className="space-y-8 text-[17px] text-foreground-secondary leading-[1.8]">
              <p>
                Scholars Opportunity Fund operates a proprietary quantitative
                screening and analysis platform built specifically for
                identifying special situation opportunities in public equities.
                The fund focuses on the segment of the market where systematic
                coverage is thinnest and the potential for mispricing is
                greatest.
              </p>
              <p>
                The platform handles the full detection and scoring pipeline,
                with live notifications and structured analyst workflows.
                Candidates that clear the fund&apos;s scoring threshold are
                surfaced to the analyst team for fundamental review before
                reaching the Chief Investment Officer for a final investment
                decision.
              </p>
              <p>
                Every step from signal detection to investment outcome is
                documented, measured, and auditable. The goal is a single
                pipeline from detection to outcome, with complete transparency
                at every stage.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Leadership */}
      <section className="border-t border-border/60 py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="text-4xl sm:text-5xl">Leadership</h2>
            </div>
            <div className="space-y-8 text-[17px] text-foreground-secondary leading-[1.8]">
              <p>
                Scholars Opportunity Fund is led by{" "}
                <strong className="font-medium text-ink">Dr. Jonathan Brogaard</strong>,
                Chief Investment Officer. Dr. Brogaard is a tenured finance
                professor, FINRA Market Regulation Committee member, and one
                of the most cited researchers in market microstructure.
              </p>
              <p>
                All investment decisions are made exclusively by the CIO.
                Student analysts operate within defined process boundaries,
                contributing analytical throughput without introducing
                uncontrolled investment risk.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Structure */}
      <section className="bg-ink py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="text-4xl text-cloud sm:text-5xl">Fund Structure</h2>
            </div>
            <div className="space-y-8 text-[17px] text-foreground-on-dark-muted leading-[1.8]">
              <p>
                Scholars Opportunity Fund is independently operated. The fund
                combines experienced GP oversight with a structured student
                analyst program that produces institutional-grade analytical
                throughput and exceptional talent development.
              </p>
              <p>
                This model has been proven in practice. The structural
                parallel to established student-run investment programs is
                direct: independent operation, student analysts at the center,
                experienced leadership making final decisions.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
