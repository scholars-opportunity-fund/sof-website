import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Insights",
  description: "This page is not yet published.",
  path: "/insights",
  noIndex: true,
});

export default function InsightsPage() {
  return (
    <section className="bg-ink py-32 sm:py-44">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Insights
          </p>
          <h1 className="mt-6 text-4xl text-cloud sm:text-5xl lg:text-6xl">
            This page is not yet published
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/" variant="outline">
              <span className="text-cloud">Return home</span>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
