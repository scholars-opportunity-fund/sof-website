import Link from "next/link";
import HeaderClient from "./HeaderClient";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cloud/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8 lg:px-12">
        <Link
          href="/"
          aria-label="Scholar Opportunity Fund home"
          className="group flex items-center gap-3 font-heading tracking-tight text-ink transition-colors hover:text-copper"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center bg-ink text-[11px] font-bold tracking-[0.15em] text-cloud transition-colors group-hover:bg-copper"
          >
            SOF
          </span>
          <span className="hidden text-xl sm:inline">
            Scholar Opportunity Fund
          </span>
          <span className="text-xl sm:hidden">SOF</span>
        </Link>
        <HeaderClient />
      </div>
    </header>
  );
}
