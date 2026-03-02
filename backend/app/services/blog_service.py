"""Blog service — business logic for lifestyle blog posts."""
from datetime import datetime, timezone
from slugify import slugify
from ..models import get_blog_repo


class BlogService:

    @staticmethod
    def get_all(page=1, per_page=12, category=None, status="published"):
        repo = get_blog_repo()
        filters = {}
        if status:
            filters["status"] = status
        if category:
            filters["category"] = category
        return repo.find_all(
            filters=filters,
            sort_by="published_at",
            sort_desc=True,
            page=page,
            per_page=per_page,
        )

    @staticmethod
    def get_by_slug(slug: str):
        repo = get_blog_repo()
        return repo.find_one(slug=slug, status="published")

    @staticmethod
    def create(data: dict):
        data["slug"] = slugify(data.get("title", ""))
        data["views"] = 0
        if data.get("status") == "published":
            data["published_at"] = datetime.now(timezone.utc).isoformat()
        repo = get_blog_repo()
        return repo.create(data)

    @staticmethod
    def update(post_id: str, data: dict):
        if "title" in data:
            data["slug"] = slugify(data["title"])
        repo = get_blog_repo()
        existing = repo.find_by_id(post_id)
        if not existing:
            return None
        if data.get("status") == "published" and existing.get("status") != "published":
            data["published_at"] = datetime.now(timezone.utc).isoformat()
        return repo.update(post_id, data)

    @staticmethod
    def delete(post_id: str):
        repo = get_blog_repo()
        return repo.delete(post_id)
