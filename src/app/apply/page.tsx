import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Apply",
  description:
    "Applications to the Scholars Opportunity Fund Student Analyst Program are not currently open.",
  path: "/apply",
});

export default function ApplyPage() {
  return (
    <section className="bg-ink py-32 sm:py-44">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Applications Closed
          </p>
          <h1 className="mt-6 text-4xl text-cloud sm:text-5xl lg:text-6xl">
            Not currently accepting applications
          </h1>
          <p className="mt-8 text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            The Student Analyst Program isn&apos;t taking applications right now.
            Students from any university can apply when the next cycle opens.
            Questions can go to contact@scholarsoppfund.com.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/program" variant="outline">
              <span className="text-cloud">About the Program</span>
            </Button>
            <Button href="/team" variant="outline">
              <span className="text-cloud">Current Team</span>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
