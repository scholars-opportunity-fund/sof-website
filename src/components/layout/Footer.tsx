import Link from "next/link";
import { FUND, FOOTER_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-ink text-foreground-on-dark">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-heading font-bold text-cloud hover:text-copper transition-colors">
              Scholars Opportunity Fund
            </Link>
            <p className="mt-4 text-sm text-foreground-on-dark-muted leading-relaxed max-w-xs">
              {FUND.description}
            </p>
          </div>

          {/* Fund links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-copper">
              Fund
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.fund.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-on-dark-muted hover:text-cloud transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Program links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-copper">
              Program
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.program.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-on-dark-muted hover:text-cloud transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-border-dark pt-8">
          <p className="text-xs text-foreground-on-dark-muted">
            &copy; {new Date().getFullYear()} {FUND.name}. All rights reserved.
            All investment decisions are made by the Chief Investment Officer.
          </p>
        </div>
      </div>
    </footer>
  );
}
