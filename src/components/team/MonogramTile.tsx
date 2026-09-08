/**
 * Stand-in for a headshot we don't have yet.
 *
 * A generic avatar silhouette reads as a bug; initials read as a choice. The
 * tile fills its container exactly the way `next/image` with `fill` does, and
 * takes the same className, so the greyscale treatment on the card applies to
 * a photo-less member without a special case.
 */
export default function MonogramTile({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-gunmetal/10 select-none ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="font-heading text-4xl tracking-[0.08em] text-foreground-muted sm:text-5xl">
        {initials(name)}
      </span>
    </div>
  );
}

/** "Riley Fontanos Alfonso" -> "RA". Single-word names keep one letter. */
function initials(name: string): string {
  const words = name
    .replace(/^(Dr|Mr|Ms|Mrs)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
