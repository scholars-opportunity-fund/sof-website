import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Our Team",
  description:
    "Meet the Scholars Opportunity Fund team. Led by Dr. Jonathan Brogaard, our team combines experienced leadership with a rigorous student analyst program.",
  path: "/team",
});

interface TeamMemberDisplay {
  name: string;
  role: string;
  title: string;
  bio?: string;
}

const leadership: TeamMemberDisplay[] = [
  {
    name: "Dr. Jonathan Brogaard",
    role: "leadership",
    title: "Chief Investment Officer",
    bio: "Tenured finance professor, FINRA Market Regulation Committee member, and one of the most cited researchers in market microstructure. All investment decisions are made by Dr. Brogaard.",
  },
];

// Placeholder for the remaining 12 team members
const team: TeamMemberDisplay[] = Array.from({ length: 12 }, (_, i) => ({
  name: `Team Member ${i + 1}`,
  role: i < 2 ? "Senior Associate" : i < 6 ? "Associate" : "Analyst",
  title: i < 2 ? "Senior Associate" : i < 6 ? "Associate" : "Analyst",
}));

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-20 sm:py-28">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            Our Team
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-cloud sm:text-5xl font-heading">
            The People Behind SOF
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-on-dark-muted leading-relaxed">
            Experienced leadership, rigorous process, and a team of analysts
            building the next generation of institutional investors.
          </p>
        </Container>
      </section>

      {/* CIO */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            {leadership.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto h-32 w-32 rounded-full bg-gunmetal flex items-center justify-center">
                  <span className="text-3xl font-heading font-bold text-copper">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h2 className="mt-6 text-2xl font-bold font-heading text-ink">
                  {member.name}
                </h2>
                <p className="mt-1 text-sm font-medium uppercase tracking-widest text-copper">
                  {member.title}
                </p>
                {member.bio && (
                  <p className="mx-auto mt-6 max-w-xl text-foreground-secondary leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team Grid */}
      <section className="bg-background-alt py-20 sm:py-24">
        <Container>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Analyst Team
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-foreground-muted">
            SOF maintains a steady cohort of 12 to 16 students, progressing
            through defined roles: Analyst, Associate, and Senior Associate.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {team.map((member, i) => (
              <Card key={i} variant="elevated" className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-cloud flex items-center justify-center">
                  <span className="text-sm font-heading font-bold text-slate">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold font-heading text-ink">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-copper">
                  {member.title}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
