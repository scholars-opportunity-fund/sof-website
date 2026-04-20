"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TeamMember } from "@/lib/team";

interface Props {
  cio: TeamMember;
  cofounders: TeamMember[];
  analysts: TeamMember[];
}

export default function TeamDirectory({ cio, cofounders, analysts }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const all = useMemo(
    () => [cio, ...cofounders, ...analysts],
    [cio, cofounders, analysts]
  );
  const active = useMemo(
    () => all.find((m) => m.slug === openSlug) ?? null,
    [all, openSlug]
  );

  const close = useCallback(() => setOpenSlug(null), []);

  // ESC to close + scroll lock when modal open
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, close]);

  return (
    <>
      {/* Leadership — CIO and Head of Research & Operations together */}
      <section className="pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <p className="text-center text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Leadership
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
            <HeadshotCard member={cio} onClick={() => setOpenSlug(cio.slug)} />
            {cofounders.map((m) => (
              <HeadshotCard
                key={m.slug}
                member={m}
                onClick={() => setOpenSlug(m.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Analysts */}
      <section className="border-t border-border/60 pt-10 pb-16 sm:pt-14 sm:pb-24">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
              Analyst Cohort
            </p>
            <p className="text-[12px] font-medium tracking-[0.15em] text-foreground-muted uppercase">
              {analysts.length} members
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {analysts.map((m) => (
              <HeadshotCard
                key={m.slug}
                member={m}
                onClick={() => setOpenSlug(m.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      {active && <MemberModal member={active} onClose={close} />}
    </>
  );
}

function HeadshotCard({
  member,
  onClick,
}: {
  member: TeamMember;
  onClick: () => void;
}) {
  const titleForBadge =
    member.role === "Chief Investment Officer"
      ? "Chief Investment Officer"
      : member.role;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label={`Open profile: ${member.name}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gunmetal/10">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10"
        />
      </div>
      <div className="mt-3">
        <p className="font-heading text-base text-ink group-hover:text-copper transition-colors">
          {member.name}
        </p>
        <p className="mt-0.5 text-[11px] font-medium tracking-[0.12em] text-copper uppercase">
          {titleForBadge}
        </p>
      </div>
    </button>
  );
}

function MemberModal({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-${member.slug}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close profile"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden bg-background shadow-2xl max-h-[90vh] flex flex-col sm:grid sm:grid-cols-[minmax(0,240px)_1fr]">
        {/* Photo */}
        <div className="relative aspect-square w-full bg-gunmetal/10 sm:aspect-auto sm:h-full">
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(min-width: 640px) 240px, 100vw"
            className="object-cover"
          />
        </div>

        {/* Text */}
        <div className="relative overflow-y-auto p-8 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-foreground-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-copper"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2
            id={`modal-${member.slug}-title`}
            className="pr-10 font-heading text-3xl text-ink sm:text-4xl"
          >
            {member.name}
          </h2>
          <p className="mt-2 text-[12px] font-medium tracking-[0.15em] text-copper uppercase">
            {member.role}
          </p>

          <div className="mt-6 h-px w-12 bg-copper" />

          <dl className="mt-6 space-y-4 text-[14px] leading-relaxed text-foreground-secondary">
            {member.credentials && (
              <div>
                <dt className="text-[11px] font-medium tracking-[0.15em] text-foreground-muted uppercase">
                  Major
                </dt>
                <dd className="mt-1">{member.credentials}</dd>
              </div>
            )}
            {member.gradYear && (
              <div>
                <dt className="text-[11px] font-medium tracking-[0.15em] text-foreground-muted uppercase">
                  Expected Graduation
                </dt>
                <dd className="mt-1">{member.gradYear}</dd>
              </div>
            )}
          </dl>

          <p className="mt-6 text-[15px] leading-[1.7] text-foreground-secondary">
            {member.bio ?? member.headline}
          </p>

          {member.linkedin && (
            <div className="mt-8">
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-ink hover:text-copper transition-colors"
                aria-label={`${member.name} on LinkedIn`}
              >
                <LinkedInIcon className="h-5 w-5" />
                <span className="border-b border-copper/60 pb-0.5">
                  View LinkedIn
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
