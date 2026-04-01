import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function readingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "...";
}

export const SITE_NAME = "CyberBolt";
export const SITE_URL = "https://cyberbolt.in";
export const SITE_DESCRIPTION =
  "AI Security & Technology Articles by CyberBolt";

export const CATEGORIES = [
  // Tech & Security
  "AI Security",
  "Machine Learning",
  "Cybersecurity",
  "Web Security",
  "Cloud Security",
  "Privacy",
  "DevSecOps",
  "Threat Intelligence",
  // Lifestyle
  "Health & Wellness",
  "Finance & Investing",
  "Life Hacks",
  "Travel & Exploration",
  "Food & Cooking",
  "Personal Growth",
  "Career & Productivity",
  "Tech Reviews",
];


