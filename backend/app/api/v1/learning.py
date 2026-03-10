"""Learning hub endpoints."""
import math
from flask import request
from flask_restx import Namespace, Resource
from ...services.learning_service import LearningService
from ...utils.decorators import admin_required
from ...extensions import limiter
from ...models.base import MAX_PER_PAGE

ns = Namespace("learning", description="AI Security Learning Hub")


@ns.route("/categories")
class LearningCategories(Resource):
    @limiter.limit("60/minute")
    def get(self):
        """Get all learning categories with resource counts."""
        return {"categories": LearningService.get_categories()}


@ns.route("/paths")
class LearningPaths(Resource):
    @limiter.limit("60/minute")
    def get(self):
        """Get all learning paths."""
        return {"paths": LearningService.get_paths()}


@ns.route("/resources")
class LearningResources(Resource):
    @limiter.limit("60/minute")
    def get(self):
        """List learning resources (paginated)."""
        page = max(1, request.args.get("page", 1, type=int))
        per_page = max(1, min(request.args.get("per_page", 12, type=int), MAX_PER_PAGE))
        category = request.args.get("category", "")[:50] or None
        difficulty = request.args.get("difficulty", "")[:20] or None
        resources, total = LearningService.get_resources(
            page=page, per_page=per_page, category=category, difficulty=difficulty
        )
        return {
            "resources": resources,
            "total": total,
            "page": page,
            "pages": math.ceil(total / per_page) if per_page else 1,
        }


@ns.route("/resources/<string:resource_id>")
class LearningResourceDetail(Resource):
    def get(self, resource_id):
        """Get a single learning resource."""
        resource = LearningService.get_resource(resource_id)
        if not resource:
            return {"error": "Resource not found"}, 404
        return {"resource": resource}


# ─── Admin ────────────────────────────────────

@ns.route("/admin")
class AdminLearningList(Resource):
    @admin_required()
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        resources, total = LearningService.get_resources(page=page, per_page=per_page)
        return {"resources": resources, "total": total, "page": page, "pages": math.ceil(total / per_page) if per_page else 1}

    @admin_required()
    @limiter.limit("30/minute")
    def post(self):
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return {"error": "Missing or invalid JSON body"}, 400
        try:
            resource = LearningService.create(data)
        except (ValueError, RuntimeError) as e:
            return {"error": str(e)}, 400
        return {"resource": resource, "message": "Resource created"}, 201


@ns.route("/admin/<string:resource_id>")
class AdminLearningDetail(Resource):
    @admin_required()
    @limiter.limit("30/minute")
    def put(self, resource_id):
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return {"error": "Missing or invalid JSON body"}, 400
        try:
            resource = LearningService.update(resource_id, data)
        except ValueError as e:
            return {"error": str(e)}, 400
        if not resource:
            return {"error": "Resource not found"}, 404
        return {"resource": resource, "message": "Resource updated"}

    @admin_required()
    def delete(self, resource_id):
        success = LearningService.delete(resource_id)
        if not success:
            return {"error": "Resource not found"}, 404
        return {"message": "Resource deleted"}
