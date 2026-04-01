"""Agentic AI endpoints — llms.txt, structured content, markdown articles, OWASP checklist."""
from flask import current_app, request
from flask_restx import Namespace, Resource, fields
from ...services.article_service import ArticleService
from ...services.owasp_service import OwaspService
from ...utils.decorators import admin_required
import bleach
import re

ns = Namespace("ai", description="Agentic AI endpoints")

# OWASP checklist models for Swagger docs
owasp_input = ns.model("OwaspInput", {
    "app_name": fields.String(required=True, description="Application name", min_length=1, max_length=100),
    "app_type": fields.String(required=True, description="Application type",
                              enum=OwaspService.get_app_types()),
})


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

        lines = [
            "# CyberBolt",
            "",
            "> AI Security Platform — Your hub for LLM security, prompt injection defense, adversarial ML, and enterprise cybersecurity.",
            "",
            "## About",
            f"- [Website](https://{domain})",
            f"- [Articles](https://{domain}/articles): In-depth cybersecurity research",
            "",
        ]

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

        return {
            "name": "CyberBolt",
            "description": "AI Security & Technology Platform",
            "url": f"https://{domain}",
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


# ─── OWASP Top 10 Checklist Generator ────────────────────────────────


@ns.route("/owasp/app-types")
class OwaspAppTypes(Resource):
    @admin_required()
    def get(self):
        """List supported application types for the OWASP checklist generator (admin only)."""
        return {"app_types": OwaspService.get_app_types()}


@ns.route("/owasp/generate")
class OwaspGenerate(Resource):
    @admin_required()
    @ns.expect(owasp_input)
    @ns.doc(
        description="Generate an OWASP Top 10 security checklist tailored to your application. "
                    "Uses a local LLM to provide contextual recommendations. Requires admin login.",
        responses={200: "Checklist generated", 400: "Validation error", 401: "Unauthorized", 503: "LLM service unavailable"},
    )
    def post(self):
        """Generate OWASP Top 10 checklist with AI-powered recommendations."""
        data = request.get_json()
        if not data:
            return {"message": "No data provided"}, 400

        app_name = (data.get("app_name") or "").strip()
        app_type = (data.get("app_type") or "").strip()

        if not app_name or not app_type:
            return {"message": "Both app_name and app_type are required"}, 400

        if len(app_name) > 100:
            return {"message": "app_name must be 100 characters or fewer"}, 400

        valid_types = OwaspService.get_app_types()
        if app_type not in valid_types:
            return {"message": f"app_type must be one of: {', '.join(valid_types)}"}, 400

        # Sanitize input
        app_name = bleach.clean(app_name, tags=[], strip=True)

        try:
            result = OwaspService.generate_checklist(app_name, app_type)
            return result, 200
        except Exception as e:
            current_app.logger.error("OWASP generation failed: %s", e)
            return {"message": "Failed to generate checklist. Please try again."}, 503
