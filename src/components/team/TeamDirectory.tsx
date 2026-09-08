"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TeamMember } from "@/lib/team";
import MonogramTile from "./MonogramTile";
import ProfileBody from "./ProfileBody";

interface Props {
  cio: TeamMember;
  cofounders: TeamMember[];
  analysts: TeamMember[];
}

/**
 * The panel's width is fixed rather than derived from the column, so the
 * left/right fit test has a constant to measure against.
 */
const PANEL_WIDTH = 320;

/** Breathing room the panel must keep from the viewport edge. */
const EDGE_GUTTER = 16;

/**
 * Which disclosure a visitor gets.
 *
 * The floor is `lg`, not `sm`: in the 640-1023px band the grid is three
 * columns of roughly 176px, so a middle-column card's panel overflows whichever
 * side it opens on — and a panel narrow enough to fit there is too narrow to
 * read a bio in. That band gets the modal, same as touch.
 */
const FOLD_OUT = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

export default function TeamDirectory({ cio, cofounders, analysts }: Props) {
  // The server has no way to know the viewer's input capability, so it renders
  // the modal path and the effect below upgrades after mount.
  const [foldOut, setFoldOut] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [side, setSide] = useState<"left" | "right">("right");

  const all = useMemo(
    () => [cio, ...cofounders, ...analysts],
    [cio, cofounders, analysts]
  );
  const modalMember = useMemo(
    () => all.find((m) => m.slug === openSlug) ?? null,
    [all, openSlug]
  );

  // A pin wins over a hover, so a pinned panel does not flicker as the pointer
  // crosses the grid.
  const activeSlug = foldOut ? (pinned ?? hovered) : null;

  const closeModal = useCallback(() => setOpenSlug(null), []);
  const clearPanel = useCallback(() => {
    setPinned(null);
    setHovered(null);
  }, []);

  // Decide which side the panel opens on from the card's real position.
  const measure = useCallback((card: HTMLElement) => {
    const rect = card.getBoundingClientRect();
    const fitsRight =
      rect.right + PANEL_WIDTH <= window.innerWidth - EDGE_GUTTER;
    setSide(fitsRight ? "right" : "left");
  }, []);

  // Capability gate. Subscribing keeps a resized window or a hybrid device on
  // the right path, and drops any open panel when the fold-out path goes away.
  useEffect(() => {
    const query = window.matchMedia(FOLD_OUT);
    const apply = () => {
      setFoldOut(query.matches);
      if (!query.matches) clearPanel();
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [clearPanel]);

  // Escape dismisses whichever panel is showing — the pin if one is set, and
  // otherwise the hover preview, which would otherwise sit over its neighbours
  // with no way to dismiss it but moving the pointer.
  useEffect(() => {
    if (!activeSlug) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") clearPanel();
    };
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-team-card]")) clearPanel();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [activeSlug, clearPanel]);

  // The modal is the one disclosure that owns the whole page, so it alone traps
  // Escape and locks scroll.
  useEffect(() => {
    if (!modalMember) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [modalMember, closeModal]);

  const cardProps = (member: TeamMember) => ({
    member,
    lit: pinned === member.slug || openSlug === member.slug,
    panelOpen: activeSlug === member.slug,
    side,
    onPreview: (card: HTMLElement) => {
      if (!foldOut || pinned) return;
      setHovered(member.slug);
      measure(card);
    },
    onLeave: () => {
      if (!foldOut || pinned) return;
      setHovered(null);
    },
    onActivate: (card: HTMLElement) => {
      if (!foldOut) {
        setOpenSlug(member.slug);
        return;
      }
      if (pinned === member.slug) {
        // Clear the hover too, or `pinned ?? hovered` would fall straight back
        // to a preview of the card the pointer is still resting on.
        clearPanel();
        return;
      }
      setPinned(member.slug);
      setHovered(member.slug);
      measure(card);
    },
  });

  return (
    <>
      {/* Leadership: CIO and Head of Research & Operations together */}
      <section className="pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-12">
          <p className="text-center text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Leadership
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
            <HeadshotCard key={cio.slug} {...cardProps(cio)} />
            {cofounders.map((m) => (
              <HeadshotCard key={m.slug} {...cardProps(m)} />
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
              <HeadshotCard key={m.slug} {...cardProps(m)} />
            ))}
          </div>
        </div>
      </section>

      {modalMember && (
        <MemberModal member={modalMember} onClose={closeModal} />
      )}
    </>
  );
}

function HeadshotCard({
  member,
  lit,
  panelOpen,
  side,
  onPreview,
  onLeave,
  onActivate,
}: {
  member: TeamMember;
  lit: boolean;
  panelOpen: boolean;
  side: "left" | "right";
  onPreview: (card: HTMLElement) => void;
  onLeave: () => void;
  onActivate: (card: HTMLElement) => void;
}) {
  const panelId = `panel-${member.slug}`;
  const headingId = `${panelId}-title`;
  // The wrapper, not the button, is what gets measured for the panel's side —
  // a ref rather than walking up from the click target, so the measurement does
  // not silently depend on the button staying a direct child.
  const wrapper = useRef<HTMLDivElement>(null);

  return (
    // The group is named because the button below already carries an unnamed
    // one; two nested unnamed groups would leave it ambiguous which drives the
    // colour. The panel lives inside this wrapper and abuts the card with no
    // gap, so the pointer never crosses dead space on its way to the LinkedIn
    // button and the hover holds.
    <div
      ref={wrapper}
      data-team-card
      data-lit={lit}
      // The wrapper is lifted while its panel is open. Without it the panel's
      // own z-index competes with later sibling cards, which paint after it in
      // DOM order and can cover the LinkedIn button.
      className={`group/card relative ${panelOpen ? "z-30" : ""}`}
      onMouseEnter={(event) => onPreview(event.currentTarget)}
      onMouseLeave={onLeave}
      onFocus={(event) => onPreview(event.currentTarget)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          onLeave();
        }
      }}
    >
      <button
        type="button"
        onClick={() => wrapper.current && onActivate(wrapper.current)}
        aria-expanded={panelOpen}
        aria-controls={panelOpen ? panelId : undefined}
        className="flex w-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        aria-label={`Open profile: ${member.name}`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-gunmetal/10 grayscale transition-[filter] duration-500 group-hover/card:grayscale-0 group-focus-within/card:grayscale-0 group-data-[lit=true]/card:grayscale-0 motion-reduce:transition-none">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 45vw"
              className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03] motion-reduce:transition-none"
            />
          ) : (
            <MonogramTile
              name={member.name}
              className="transition-transform duration-500 group-hover/card:scale-[1.03] motion-reduce:transition-none"
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover/card:bg-ink/10"
          />
        </div>
        <div className="mt-3">
          <p className="font-heading text-base text-ink transition-colors group-hover/card:text-copper">
            {member.name}
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.12em] text-copper uppercase">
            {member.role}
          </p>
        </div>
      </button>

      {panelOpen && (
        <FoldOutPanel
          member={member}
          side={side}
          panelId={panelId}
          headingId={headingId}
        />
      )}
    </div>
  );
}

function FoldOutPanel({
  member,
  side,
  panelId,
  headingId,
}: {
  member: TeamMember;
  side: "left" | "right";
  panelId: string;
  headingId: string;
}) {
  // Mount first, then show, so the panel has a state to transition from.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const resting = side === "right" ? "-translate-x-2" : "translate-x-2";

  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={headingId}
      style={{ width: PANEL_WIDTH }}
      className={[
        "absolute top-0 z-30 max-h-[26rem] overflow-y-auto",
        "border border-border/70 bg-background p-6 shadow-2xl",
        "transition-[opacity,transform] duration-200 motion-reduce:transition-none",
        side === "right" ? "left-full" : "right-full",
        shown ? "translate-x-0 opacity-100" : `${resting} opacity-0`,
      ].join(" ")}
    >
      <ProfileBody member={member} variant="panel" headingId={headingId} />
    </div>
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
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden bg-background shadow-2xl sm:grid sm:grid-cols-[minmax(0,240px)_1fr]">
        {/* Photo */}
        <div className="relative aspect-square w-full bg-gunmetal/10 sm:aspect-auto sm:h-full">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="(min-width: 640px) 240px, 100vw"
              className="object-cover"
            />
          ) : (
            <MonogramTile name={member.name} />
          )}
        </div>

        {/* Text */}
        <div className="relative overflow-y-auto p-8 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center text-foreground-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-copper"
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

          <ProfileBody
            member={member}
            variant="modal"
            headingId={`modal-${member.slug}-title`}
          />
        </div>
      </div>
    </div>
  );
}
