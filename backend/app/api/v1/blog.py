"""Blog endpoints — public + admin CRUD."""
import math
from flask import request
from flask_restx import Namespace, Resource
from ...services.blog_service import BlogService
from ...utils.decorators import admin_required
from ...extensions import limiter
from ...models.base import MAX_PER_PAGE

ns = Namespace("blog", description="Lifestyle blog")


@ns.route("")
class BlogList(Resource):
    @limiter.limit("60/minute")
    def get(self):
        """List published blog posts."""
        page = max(1, request.args.get("page", 1, type=int))
        per_page = max(1, min(request.args.get("per_page", 12, type=int), MAX_PER_PAGE))
        category = request.args.get("category", "")[:50] or None
        posts, total = BlogService.get_all(page=page, per_page=per_page, category=category)
        return {
            "posts": posts,
            "total": total,
            "page": page,
            "pages": math.ceil(total / per_page) if per_page else 1,
        }


@ns.route("/<string:slug>")
class BlogBySlug(Resource):
    def get(self, slug):
        """Get a blog post by slug."""
        post = BlogService.get_by_slug(slug)
        if not post:
            return {"error": "Post not found"}, 404
        return {"post": post}


# ─── Admin ────────────────────────────────────

@ns.route("/admin")
class AdminBlogList(Resource):
    @admin_required()
    def get(self):
        """List all blog posts (admin)."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        posts, total = BlogService.get_all(page=page, per_page=per_page, status=None)
        return {"posts": posts, "total": total, "page": page, "pages": math.ceil(total / per_page) if per_page else 1}

    @admin_required()
    @limiter.limit("30/minute")
    def post(self):
        """Create a blog post."""
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return {"error": "Missing or invalid JSON body"}, 400
        try:
            post = BlogService.create(data)
        except (ValueError, RuntimeError) as e:
            return {"error": str(e)}, 400
        return {"post": post, "message": "Post created"}, 201


@ns.route("/admin/<string:post_id>")
class AdminBlogDetail(Resource):
    @admin_required()
    @limiter.limit("30/minute")
    def put(self, post_id):
        """Update a blog post."""
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return {"error": "Missing or invalid JSON body"}, 400
        try:
            post = BlogService.update(post_id, data)
        except ValueError as e:
            return {"error": str(e)}, 400
        if not post:
            return {"error": "Post not found"}, 404
        return {"post": post, "message": "Post updated"}

    @admin_required()
    def delete(self, post_id):
        """Delete a blog post."""
        success = BlogService.delete(post_id)
        if not success:
            return {"error": "Post not found"}, 404
        return {"message": "Post deleted"}
