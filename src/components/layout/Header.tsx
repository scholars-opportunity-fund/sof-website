import Link from "next/link";
import HeaderClient from "./HeaderClient";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cloud/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8 lg:px-12">
        <Link
          href="/"
          className="font-heading text-xl tracking-tight text-ink hover:text-copper transition-colors"
        >
          Scholars Opportunity Fund
        </Link>
        <HeaderClient />
      </div>
    </header>
  );
}
