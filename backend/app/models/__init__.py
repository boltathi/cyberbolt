"""Model repository factory functions."""
from flask import current_app
from .base import JsonRepository

_repos = {}


def _get_repo(name: str) -> JsonRepository:
    if name not in _repos:
        data_dir = current_app.config.get("DATA_DIR", "data")
        _repos[name] = JsonRepository(data_dir, name)
    return _repos[name]


def get_articles_repo() -> JsonRepository:
    return _get_repo("articles")


def get_blog_repo() -> JsonRepository:
    return _get_repo("blog")


def get_learning_repo() -> JsonRepository:
    return _get_repo("learning")


def get_users_repo() -> JsonRepository:
    return _get_repo("users")
