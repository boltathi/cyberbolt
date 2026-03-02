"""Blog endpoints — public + admin CRUD."""
import math
from flask import request
from flask_restx import Namespace, Resource
from ...services.blog_service import BlogService
from ...utils.decorators import admin_required

ns = Namespace("blog", description="Lifestyle blog")


@ns.route("")
class BlogList(Resource):
    def get(self):
        """List published blog posts."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 12, type=int)
        category = request.args.get("category")
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
    def post(self):
        """Create a blog post."""
        data = request.get_json()
        if not data:
            return {"error": "Missing JSON body"}, 400
        post = BlogService.create(data)
        return {"post": post, "message": "Post created"}, 201


@ns.route("/admin/<string:post_id>")
class AdminBlogDetail(Resource):
    @admin_required()
    def put(self, post_id):
        """Update a blog post."""
        data = request.get_json()
        if not data:
            return {"error": "Missing JSON body"}, 400
        post = BlogService.update(post_id, data)
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
