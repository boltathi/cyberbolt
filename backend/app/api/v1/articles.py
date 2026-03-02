"""Article endpoints — public + admin CRUD."""
import math
from flask import request
from flask_restx import Namespace, Resource
from ...services.article_service import ArticleService
from ...utils.decorators import admin_required

ns = Namespace("articles", description="Cybersecurity articles")


@ns.route("")
class ArticleList(Resource):
    def get(self):
        """List published articles (paginated)."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 12, type=int)
        category = request.args.get("category")
        tag = request.args.get("tag")

        articles, total = ArticleService.get_all(page=page, per_page=per_page, category=category, tag=tag)
        return {
            "articles": articles,
            "total": total,
            "page": page,
            "pages": math.ceil(total / per_page) if per_page else 1,
        }


@ns.route("/featured")
class FeaturedArticles(Resource):
    def get(self):
        """Get featured articles."""
        limit = request.args.get("limit", 3, type=int)
        articles = ArticleService.get_featured(limit)
        return {"articles": articles}


@ns.route("/categories")
class ArticleCategories(Resource):
    def get(self):
        """Get article categories with counts."""
        return {"categories": ArticleService.get_categories()}


@ns.route("/search")
class ArticleSearch(Resource):
    def get(self):
        """Search articles."""
        q = request.args.get("q", "")
        page = request.args.get("page", 1, type=int)
        if not q:
            return {"articles": [], "total": 0, "page": 1, "pages": 0}
        articles, total = ArticleService.search(q, page)
        return {
            "articles": articles,
            "total": total,
            "page": page,
            "pages": math.ceil(total / 12),
        }


@ns.route("/<string:slug>")
class ArticleBySlug(Resource):
    def get(self, slug):
        """Get a published article by slug."""
        article = ArticleService.get_by_slug(slug)
        if not article:
            return {"error": "Article not found"}, 404
        return {"article": article}


# ─── Admin endpoints ──────────────────────────

@ns.route("/admin")
class AdminArticleList(Resource):
    @admin_required()
    def get(self):
        """List all articles (admin, includes drafts)."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        articles, total = ArticleService.get_all(page=page, per_page=per_page, status=None)
        return {
            "articles": articles,
            "total": total,
            "page": page,
            "pages": math.ceil(total / per_page) if per_page else 1,
        }

    @admin_required()
    def post(self):
        """Create a new article."""
        data = request.get_json()
        if not data:
            return {"error": "Missing JSON body"}, 400
        article = ArticleService.create(data)
        return {"article": article, "message": "Article created"}, 201


@ns.route("/admin/<string:article_id>")
class AdminArticleDetail(Resource):
    @admin_required()
    def put(self, article_id):
        """Update an article."""
        data = request.get_json()
        if not data:
            return {"error": "Missing JSON body"}, 400
        article = ArticleService.update(article_id, data)
        if not article:
            return {"error": "Article not found"}, 404
        return {"article": article, "message": "Article updated"}

    @admin_required()
    def delete(self, article_id):
        """Delete an article."""
        success = ArticleService.delete(article_id)
        if not success:
            return {"error": "Article not found"}, 404
        return {"message": "Article deleted"}
