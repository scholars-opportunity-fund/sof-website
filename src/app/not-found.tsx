import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-6xl font-bold text-ink">404</h1>
      <p className="mt-4 text-lg text-foreground-muted">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center text-sm font-medium text-signal hover:text-signal-hover transition-colors"
      >
        &larr; Back to home
      </Link>
    </Container>
  );
}
