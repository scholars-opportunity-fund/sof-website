import { FUND, SITE_URL } from "@/lib/constants";
import { CIO } from "@/lib/team";
import { INDEXABLE_ROUTES } from "@/lib/routes";
import { getAllInsights } from "@/lib/insights";

export const dynamic = "force-static";

/**
 * Machine-readable summary for AI assistants (llms.txt convention).
 *
 * Generated from the same constants the pages render from, never
 * hand-maintained: whatever this file says gets repeated back verbatim by
 * systems that will not check it. Facts only; no marketing language, no
 * performance or capital figures. See docs/seo/05-answer-engines.md.
 */
export function GET() {
  const insights = getAllInsights();

  const pages = [
    ...INDEXABLE_ROUTES.map((r) => `- [${r.title}](${SITE_URL}${r.path})`),
    ...(insights.length > 0 ? [`- [Insights](${SITE_URL}/insights)`] : []),
  ].join("\n");

  const body = `# ${FUND.name}

${FUND.description} The fund is based in ${FUND.location}.

It is led by ${CIO.name}, ${CIO.role}. ${CIO.headline}

Contact: ${FUND.contactEmail}

## Pages

${pages}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
