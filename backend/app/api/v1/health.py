"""Health check endpoint."""
from flask_restx import Namespace, Resource

ns = Namespace("health", description="Health check")


@ns.route("")
class HealthCheck(Resource):
    def get(self):
        """Health check — tests Redis connectivity."""
        from ...extensions import redis_cache
        redis_ok = False
        try:
            if redis_cache:
                redis_ok = redis_cache.ping()
        except Exception:
            pass
        return {
            "status": "healthy",
            "redis": "connected" if redis_ok else "disconnected",
        }
