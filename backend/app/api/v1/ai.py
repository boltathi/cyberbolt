"""Agentic AI endpoints — llms.txt, structured content, markdown articles."""
from flask import current_app
from flask_restx import Namespace, Resource
from ...services.article_service import ArticleService
from ...services.learning_service import LearningService
import bleach
import re

ns = Namespace("ai", description="Agentic AI endpoints")


def strip_html(html: str) -> str:
    """Convert HTML to plain text for markdown output."""
    text = bleach.clean(html, tags=[], strip=True)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


@ns.route("/llms.txt")
class LlmsTxt(Resource):
    def get(self):
        """Serve llms.txt — AI agent discovery file per llmstxt.org spec."""
        domain = current_app.config.get("DOMAIN", "cyberbolt.in")
        articles = ArticleService.get_all_for_ai()
        categories = LearningService.get_categories()

        lines = [
            "# CyberBolt",
            "",
            "> AI Security Learning Platform — Your hub for LLM security, prompt injection defense, adversarial ML, and enterprise cybersecurity.",
            "",
            "## About",
            f"- [Website](https://{domain})",
            f"- [Articles](https://{domain}/articles): In-depth cybersecurity research",
            f"- [Learning Hub](https://{domain}/learning): Structured AI security learning paths",
            f"- [Blog](https://{domain}/blog): Lifestyle and career insights",
            "",
            "## Topics",
        ]
        for cat in categories:
            lines.append(f"- {cat['icon']} {cat['name']}: {cat.get('description', '')}")

        if articles:
            lines.extend(["", "## Articles"])
            for a in articles[:20]:
                lines.append(f"- [{a['title']}](https://{domain}/articles/{a['slug']}): {a.get('excerpt', '')[:120]}")

        lines.extend([
            "",
            "## API",
            f"- [Articles API](https://{domain}/api/v1/articles)",
            f"- [AI Content](https://{domain}/api/v1/ai/content)",
            f"- [Swagger Docs](https://{domain}/api/v1/docs)",
            "",
            "## Contact",
            f"- Website: https://{domain}",
            f"- Email: admin@{domain}",
        ])

        return "\n".join(lines), 200, {"Content-Type": "text/plain; charset=utf-8"}


@ns.route("/content")
class AIContent(Resource):
    def get(self):
        """Structured JSON content for AI agents."""
        domain = current_app.config.get("DOMAIN", "cyberbolt.in")
        articles = ArticleService.get_all_for_ai()
        categories = LearningService.get_categories()
        paths = LearningService.get_paths()

        return {
            "name": "CyberBolt",
            "description": "AI Security Learning Platform",
            "url": f"https://{domain}",
            "topics": [c["name"] for c in categories],
            "learning_paths": paths,
            "articles": [
                {
                    "title": a["title"],
                    "slug": a["slug"],
                    "url": f"https://{domain}/articles/{a['slug']}",
                    "excerpt": a.get("excerpt", ""),
                    "category": a.get("category", ""),
                    "tags": a.get("tags", []),
                    "published_at": a.get("published_at", ""),
                }
                for a in articles
            ],
        }


@ns.route("/articles/<string:slug>.md")
class ArticleMarkdown(Resource):
    def get(self, slug):
        """Get article as markdown for AI consumption."""
        article = ArticleService.get_by_slug(slug)
        if not article:
            return {"error": "Article not found"}, 404

        md = f"# {article['title']}\n\n"
        if article.get("excerpt"):
            md += f"> {article['excerpt']}\n\n"
        md += f"**Category**: {article.get('category', '')}\n"
        md += f"**Tags**: {', '.join(article.get('tags', []))}\n\n"
        md += "---\n\n"
        md += strip_html(article.get("content", ""))

        return md, 200, {"Content-Type": "text/markdown; charset=utf-8"}
