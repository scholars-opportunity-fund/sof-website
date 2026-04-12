import Container from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Our Team",
  description:
    "Meet the Scholars Opportunity Fund team. Led by Dr. Jonathan Brogaard, our team combines experienced leadership with a rigorous student analyst program.",
  path: "/team",
});

interface TeamMemberDisplay {
  name: string;
  title: string;
  bio?: string;
}

const leadership: TeamMemberDisplay[] = [
  {
    name: "Dr. Jonathan Brogaard",
    title: "Chief Investment Officer",
    bio: "Tenured finance professor, FINRA Market Regulation Committee member, and one of the most cited researchers in market microstructure. All investment decisions are made by Dr. Brogaard.",
  },
];

const team: TeamMemberDisplay[] = Array.from({ length: 12 }, (_, i) => ({
  name: `Team Member ${i + 1}`,
  title: i < 2 ? "Senior Associate" : i < 6 ? "Associate" : "Analyst",
}));

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-36 sm:py-44">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Our Team
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            The people behind SOF
          </h1>
          <p className="mt-8 max-w-xl text-[17px] text-foreground-on-dark-muted leading-[1.8]">
            Experienced leadership, rigorous process, and a team of analysts
            building the next generation of institutional investors.
          </p>
        </Container>
      </section>

      {/* CIO */}
      <section className="py-32 sm:py-40">
        <Container>
          {leadership.map((member) => (
            <div key={member.name} className="grid gap-16 lg:grid-cols-[280px_1fr] lg:gap-24">
              <div>
                <div className="h-72 w-full bg-gunmetal/10 flex items-end justify-center overflow-hidden">
                  <span className="text-5xl font-heading text-slate/30 pb-8">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-4xl sm:text-5xl">{member.name}</h2>
                <p className="mt-3 text-[14px] font-medium tracking-[0.15em] text-copper uppercase">
                  {member.title}
                </p>
                {member.bio && (
                  <p className="mt-8 max-w-xl text-[17px] text-foreground-secondary leading-[1.8]">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Team Grid */}
      <section className="border-t border-border/60 py-32 sm:py-40">
        <Container>
          <h2 className="text-4xl sm:text-5xl">Analyst Team</h2>
          <p className="mt-6 max-w-xl text-[17px] text-foreground-muted leading-[1.8]">
            SOF maintains a steady cohort of 12 to 16 students, progressing
            through defined roles: Analyst, Associate, and Senior Associate.
          </p>
          <div className="mt-16 grid gap-px bg-border/40 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <div key={i} className="bg-background p-8">
                <div className="h-48 w-full bg-gunmetal/5 flex items-end justify-center overflow-hidden mb-6">
                  <span className="text-2xl font-heading text-slate/20 pb-4">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <p className="font-heading text-lg text-ink">{member.name}</p>
                <p className="mt-1 text-[13px] font-medium tracking-[0.1em] text-copper uppercase">
                  {member.title}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
