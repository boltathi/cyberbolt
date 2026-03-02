"""Flask extensions and Redis initialization."""
import redis as redis_lib
from flask_caching import Cache
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

cache = Cache()
cors = CORS()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)

# Redis clients (initialized in create_app)
redis_cache = None
redis_session = None
redis_jwt = None


def init_redis(app):
    """Initialize Redis clients for different purposes."""
    global redis_cache, redis_session, redis_jwt
    try:
        redis_cache = redis_lib.from_url(app.config["REDIS_URL"], decode_responses=True)
        redis_session = redis_lib.from_url(app.config["REDIS_SESSION_URL"], decode_responses=True)
        redis_jwt = redis_lib.from_url(app.config["REDIS_JWT_BLOCKLIST_URL"], decode_responses=True)
        # Test connection
        redis_cache.ping()
    except Exception as e:
        app.logger.warning(f"Redis not available: {e}. Running without Redis.")
        redis_cache = None
        redis_session = None
        redis_jwt = None
