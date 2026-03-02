"""Learning hub endpoints."""
import math
from flask import request
from flask_restx import Namespace, Resource
from ...services.learning_service import LearningService
from ...utils.decorators import admin_required

ns = Namespace("learning", description="AI Security Learning Hub")


@ns.route("/categories")
class LearningCategories(Resource):
    def get(self):
        """Get all learning categories with resource counts."""
        return {"categories": LearningService.get_categories()}


@ns.route("/paths")
class LearningPaths(Resource):
    def get(self):
        """Get all learning paths."""
        return {"paths": LearningService.get_paths()}


@ns.route("/resources")
class LearningResources(Resource):
    def get(self):
        """List learning resources (paginated)."""
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 12, type=int)
        category = request.args.get("category")
        difficulty = request.args.get("difficulty")
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
    def post(self):
        data = request.get_json()
        if not data:
            return {"error": "Missing JSON body"}, 400
        resource = LearningService.create(data)
        return {"resource": resource, "message": "Resource created"}, 201


@ns.route("/admin/<string:resource_id>")
class AdminLearningDetail(Resource):
    @admin_required()
    def put(self, resource_id):
        data = request.get_json()
        if not data:
            return {"error": "Missing JSON body"}, 400
        resource = LearningService.update(resource_id, data)
        if not resource:
            return {"error": "Resource not found"}, 404
        return {"resource": resource, "message": "Resource updated"}

    @admin_required()
    def delete(self, resource_id):
        success = LearningService.delete(resource_id)
        if not success:
            return {"error": "Resource not found"}, 404
        return {"message": "Resource deleted"}
