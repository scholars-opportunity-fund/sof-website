export interface InsightFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  category: "market-research" | "post-mortem" | "commentary";
  tags?: string[];
  image?: string;
}

export interface InsightMeta extends InsightFrontmatter {
  slug: string;
}

export interface TeamMember {
  name: string;
  role: string;
  title: string;
  bio?: string;
  image?: string;
  order: number;
}
