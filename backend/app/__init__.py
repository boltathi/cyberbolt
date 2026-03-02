"""CyberBolt Application Factory."""
import os
from flask import Flask, jsonify
from .config import config_map
from .extensions import cache, cors, jwt, limiter, init_redis


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure the Flask application."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "production")

    app = Flask(__name__)
    app.config.from_object(config_map.get(config_name, config_map["production"]))

    # Initialize extensions
    cache.init_app(app)
    cors.init_app(app, origins=app.config.get("CORS_ORIGINS", "*").split(","))
    jwt.init_app(app)
    limiter.init_app(app)

    # Initialize Redis connections
    with app.app_context():
        init_redis(app)

    # Register API blueprint
    from .api.v1 import api_bp
    app.register_blueprint(api_bp)

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({"error": "Rate limit exceeded", "message": str(e.description)}), 429

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # JWT callbacks
    @jwt.token_in_blocklist_loader
    def check_token_blocklist(jwt_header, jwt_payload):
        from .extensions import redis_jwt
        if redis_jwt:
            jti = jwt_payload["jti"]
            return redis_jwt.get(f"blocklist:{jti}") is not None
        return False

    # Ensure admin user on startup
    with app.app_context():
        from .services.auth_service import AuthService
        AuthService.ensure_admin_exists()

    return app
