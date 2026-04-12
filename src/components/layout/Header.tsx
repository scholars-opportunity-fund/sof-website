import Link from "next/link";
import HeaderClient from "./HeaderClient";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cloud/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-ink hover:text-copper transition-colors"
        >
          <span className="font-heading">Scholars Opportunity Fund</span>
        </Link>
        <HeaderClient />
      </div>
    </header>
  );
}
