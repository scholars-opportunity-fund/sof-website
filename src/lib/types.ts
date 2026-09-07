export interface InsightFrontmatter {
  title: string;
  description: string;
  date: string;
  /** Set when a published piece is materially edited; feeds sitemap lastmod and Article schema. */
  dateModified?: string;
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
