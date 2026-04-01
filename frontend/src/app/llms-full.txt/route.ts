import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:5000";

    // Get all articles as markdown
    const contentRes = await fetch(`${backendUrl}/api/v1/ai/content`, {
      next: { revalidate: 3600 },
    });

    let articlesSection = "";
    if (contentRes.ok) {
      const data = await contentRes.json();
      for (const article of data.articles || []) {
        articlesSection += `\n---\n\n## ${article.title}\n\n`;
        articlesSection += `Category: ${article.category}\n`;
        articlesSection += `URL: https://cyberbolt.in/articles/${article.slug}\n\n`;
        articlesSection += `${article.content}\n`;
      }
    }

    const full = `# CyberBolt — Full Content (cyberbolt.in)

> Complete AI-readable content from CyberBolt

## About
CyberBolt is an AI Security & Technology platform featuring in-depth articles on AI security,
machine learning threats, cybersecurity research, and technology insights.

## Content Index
- Articles: https://cyberbolt.in/articles
- About: https://cyberbolt.in/about
- Contact: https://cyberbolt.in/contact

## API Endpoints
- Articles: https://cyberbolt.in/api/v1/articles
- AI Content: https://cyberbolt.in/api/v1/ai/content
- Individual Article MD: https://cyberbolt.in/api/v1/ai/articles/{slug}.md
${articlesSection}
`;

    return new NextResponse(full, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new NextResponse("# CyberBolt — Content unavailable", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
