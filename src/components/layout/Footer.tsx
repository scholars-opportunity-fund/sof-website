import Image from "next/image";
import Link from "next/link";
import { FUND, FOOTER_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border-dark/60 bg-ink text-foreground-on-dark">
      <div className="mx-auto max-w-7xl px-8 py-14 lg:px-12">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-heading text-lg text-cloud hover:text-copper transition-colors"
            >
              <Image
                src="/brand/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 flex-shrink-0"
              />
              Scholars Opportunity Fund
            </Link>
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-foreground-on-dark-muted">
              {FUND.description}
            </p>
            <p className="mt-6 text-[13px] text-foreground-on-dark-muted/70">
              {FUND.location}
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

          <div>
            <p className="text-xs font-medium tracking-[0.15em] text-copper uppercase">
              Contact
            </p>
            <ul className="mt-6 space-y-4">
              {FOOTER_LINKS.contact.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="break-all text-[14px] text-foreground-on-dark-muted transition-colors hover:text-cloud"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-border-dark/40 pt-6">
          <p className="text-[13px] text-foreground-on-dark-muted/60">
            &copy; {new Date().getFullYear()} {FUND.name}. All rights reserved.
          </p>
          <p className="text-[12px] text-foreground-on-dark-muted/60">Nothing on this site is an offer to sell or a solicitation of an offer to buy any security.</p>
        </div>
      </div>
    </footer>
  );
}
