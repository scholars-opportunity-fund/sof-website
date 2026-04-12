import Link from "next/link";
import { FUND, FOOTER_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-ink text-foreground-on-dark">
      <div className="mx-auto max-w-7xl px-8 py-20 lg:px-12">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
          <div>
            <Link href="/" className="font-heading text-lg text-cloud hover:text-copper transition-colors">
              Scholars Opportunity Fund
            </Link>
            <p className="mt-6 text-[14px] text-foreground-on-dark-muted leading-relaxed max-w-xs">
              {FUND.description}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.15em] text-copper uppercase">
              Fund
            </p>
            <ul className="mt-6 space-y-4">
              {FOOTER_LINKS.fund.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-foreground-on-dark-muted hover:text-cloud transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.15em] text-copper uppercase">
              Program
            </p>
            <ul className="mt-6 space-y-4">
              {FOOTER_LINKS.program.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-foreground-on-dark-muted hover:text-cloud transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-border-dark/40 pt-8">
          <p className="text-[13px] text-foreground-on-dark-muted/60">
            &copy; {new Date().getFullYear()} {FUND.name}. All rights reserved.
            All investment decisions are made by the Chief Investment Officer.
          </p>
        </div>
      </div>
    </footer>
  );
}
