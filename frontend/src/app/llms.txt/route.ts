import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:5000";
    const res = await fetch(`${backendUrl}/api/v1/ai/llms.txt`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const text = await res.text();
      return new NextResponse(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch {}

  const fallback = `# CyberBolt (cyberbolt.in)

> AI Security & Technology Articles

## About
CyberBolt is a platform dedicated to exploring the intersection of artificial intelligence and cybersecurity.

## Content
- Articles: https://cyberbolt.in/articles
- About: https://cyberbolt.in/about

## API
- Articles API: https://cyberbolt.in/api/v1/articles
- AI Content: https://cyberbolt.in/api/v1/ai/content
`;

  return new NextResponse(fallback, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
