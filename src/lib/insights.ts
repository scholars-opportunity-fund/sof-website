import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { InsightMeta } from "./types";

const INSIGHTS_DIR = path.join(process.cwd(), "content/insights");

export function getAllInsights(): InsightMeta[] {
  if (!fs.existsSync(INSIGHTS_DIR)) return [];

  const files = fs
    .readdirSync(INSIGHTS_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const insights = files.map((filename) => {
    const filePath = path.join(INSIGHTS_DIR, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug: filename.replace(/\.mdx$/, ""),
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      author: data.author || "",
      category: data.category || "commentary",
      tags: data.tags || [],
      image: data.image,
    } as InsightMeta;
  });

  return insights.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getInsightBySlug(slug: string) {
  const filePath = path.join(INSIGHTS_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    meta: {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      author: data.author || "",
      category: data.category || "commentary",
      tags: data.tags || [],
      image: data.image,
    } as InsightMeta,
    content,
  };
}

export function getAllInsightSlugs(): string[] {
  if (!fs.existsSync(INSIGHTS_DIR)) return [];

  return fs
    .readdirSync(INSIGHTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
