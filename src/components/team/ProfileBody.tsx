import type { TeamMember } from "@/lib/team";

/**
 * The written half of a member's profile: name, role, major, graduation, bio,
 * and the LinkedIn link.
 *
 * Both disclosures render this — the centered modal on touch and narrow
 * viewports, and the fold-out panel on wide hover-capable ones — so the content
 * exists in one place and the two paths cannot drift. The variant changes
 * spacing and type scale only, never what is shown.
 */
export default function ProfileBody({
  member,
  variant,
  headingId,
}: {
  member: TeamMember;
  variant: "modal" | "panel";
  headingId: string;
}) {
  const panel = variant === "panel";

  return (
    <>
      {/* LinkedIn sits beside the name, so it is in view the moment a profile opens
          however long the bio runs. The modal's row stops short of its close button. */}
      <div className={`flex items-start justify-between gap-4 ${panel ? "" : "pr-10"}`}>
        <div className="min-w-0">
          <h2
            id={headingId}
            className={
              panel
                ? "font-heading text-2xl text-ink"
                : "font-heading text-3xl text-ink sm:text-4xl"
            }
          >
            {member.name}
          </h2>
          <p
            className={`${panel ? "mt-1.5" : "mt-2"} text-[12px] font-medium tracking-[0.15em] text-copper uppercase`}
          >
            {member.role}
          </p>
        </div>

        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            title="View LinkedIn"
            className={`${panel ? "mt-0.5 h-9 w-9" : "mt-1 h-10 w-10"} flex shrink-0 items-center justify-center border border-border text-ink transition-colors hover:border-copper hover:text-copper focus:outline-none focus-visible:ring-2 focus-visible:ring-copper`}
          >
            <LinkedInIcon className={panel ? "h-4 w-4" : "h-[18px] w-[18px]"} />
          </a>
        )}
      </div>

      <div className={`${panel ? "mt-4" : "mt-6"} h-px w-12 bg-copper`} />

      {(member.credentials || member.gradYear) && (
        <dl
          className={`${panel ? "mt-4 space-y-3" : "mt-6 space-y-4"} text-[14px] leading-relaxed text-foreground-secondary`}
        >
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
      )}

      <p
        className={`${panel ? "mt-4 text-[14px] leading-[1.65]" : "mt-6 text-[15px] leading-[1.7]"} text-foreground-secondary`}
      >
        {member.bio ?? member.headline}
      </p>
    </>
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
