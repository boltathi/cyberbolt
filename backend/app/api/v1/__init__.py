"""API v1 Blueprint and Flask-RESTX initialization."""
from flask import Blueprint
from flask_restx import Api

api_bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")

api = Api(
    api_bp,
    version="1.0",
    title="CyberBolt API",
    description="AI Security Learning Platform — cyberbolt.in",
    doc="/docs",
)

# Register namespaces
from .health import ns as health_ns
from .auth import ns as auth_ns
from .articles import ns as articles_ns
from .blog import ns as blog_ns
from .learning import ns as learning_ns
from .ai import ns as ai_ns
from .contact import ns as contact_ns

api.add_namespace(health_ns)
api.add_namespace(auth_ns)
api.add_namespace(articles_ns)
api.add_namespace(blog_ns)
api.add_namespace(learning_ns)
api.add_namespace(ai_ns)
api.add_namespace(contact_ns)
