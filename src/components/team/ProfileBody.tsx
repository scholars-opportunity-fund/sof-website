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
      <h2
        id={headingId}
        className={
          panel
            ? "pr-2 font-heading text-2xl text-ink"
            : "pr-10 font-heading text-3xl text-ink sm:text-4xl"
        }
      >
        {member.name}
      </h2>
      <p
        className={`${panel ? "mt-1.5" : "mt-2"} text-[12px] font-medium tracking-[0.15em] text-copper uppercase`}
      >
        {member.role}
      </p>

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

      {member.linkedin && (
        <div className={panel ? "mt-6" : "mt-8"}>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-ink transition-colors hover:text-copper"
            aria-label={`${member.name} on LinkedIn`}
          >
            <LinkedInIcon className="h-5 w-5" />
            <span className="border-b border-copper/60 pb-0.5">
              View LinkedIn
            </span>
          </a>
        </div>
      )}
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
