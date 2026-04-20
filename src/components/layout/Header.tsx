import Image from "next/image";
import Link from "next/link";
import HeaderClient from "./HeaderClient";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cloud/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8 lg:px-12">
        <Link
          href="/"
          aria-label="Scholars Opportunity Fund home"
          className="group flex items-center gap-3 font-heading tracking-tight text-ink transition-colors hover:text-copper"
        >
          <Image
            src="/brand/logo-on-light.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10 flex-shrink-0"
          />
          <span className="hidden text-xl sm:inline">
            Scholars Opportunity Fund
          </span>
          <span className="text-xl sm:hidden">Scholars Opportunity Fund</span>
        </Link>
        <HeaderClient />
      </div>
    </header>
  );
}
