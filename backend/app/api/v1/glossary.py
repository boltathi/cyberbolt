"""Glossary endpoints — public cybersecurity terminology."""
from flask import request
from flask_restx import Namespace, Resource
from ...services.glossary_service import GlossaryService
from ...extensions import limiter

ns = Namespace("glossary", description="Cybersecurity glossary")


@ns.route("")
class GlossaryList(Resource):
    @limiter.limit("60/minute")
    def get(self):
        """List all glossary terms (optionally filter by q= or category=)."""
        query = request.args.get("q", "").strip()[:100]
        category = request.args.get("category", "").strip()[:50]
        terms = GlossaryService.get_all(query=query, category=category)
        return {
            "terms": terms,
            "total": len(terms),
            "categories": GlossaryService.get_categories(),
        }


@ns.route("/<string:slug>")
class GlossaryTerm(Resource):
    def get(self, slug):
        """Get a single glossary term by slug."""
        term = GlossaryService.get_by_slug(slug)
        if not term:
            return {"error": "Term not found"}, 404
        return {"term": term}
