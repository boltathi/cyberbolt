"""Application configuration."""
import os


class BaseConfig:
    """Base configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    DEBUG = False
    TESTING = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Redis
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_SESSION_URL = os.getenv("REDIS_SESSION_URL", "redis://localhost:6379/1")
    REDIS_RATE_LIMIT_URL = os.getenv("REDIS_RATE_LIMIT_URL", "redis://localhost:6379/2")
    REDIS_JWT_BLOCKLIST_URL = os.getenv("REDIS_JWT_BLOCKLIST_URL", "redis://localhost:6379/3")

    # Cache
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CACHE_DEFAULT_TIMEOUT = 300

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")

    # Rate Limiting
    RATELIMIT_STORAGE_URI = os.getenv("REDIS_RATE_LIMIT_URL", "redis://localhost:6379/2")
    RATELIMIT_DEFAULT = os.getenv("RATE_LIMIT_DEFAULT", "200/hour")

    # Data
    DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "data"))

    # Admin
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "change-me-in-production")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@cyberbolt.in")

    # Domain
    DOMAIN = os.getenv("DOMAIN", "cyberbolt.in")


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    CACHE_TYPE = "SimpleCache"


class ProductionConfig(BaseConfig):
    pass


class TestingConfig(BaseConfig):
    TESTING = True
    CACHE_TYPE = "SimpleCache"
    RATELIMIT_ENABLED = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
