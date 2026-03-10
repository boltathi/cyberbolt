"""Learning service — business logic for AI security learning hub."""
from ..models import get_learning_repo
from ..utils.sanitize import sanitize_html, sanitize_plain, sanitize_tags


LEARNING_CATEGORIES = [
    {"id": "ai-ml-fundamentals", "name": "AI/ML Fundamentals", "icon": "🧠", "description": "Core machine learning and AI concepts."},
    {"id": "llm-security", "name": "LLM Security", "icon": "🔒", "description": "Security of large language models."},
    {"id": "prompt-injection", "name": "Prompt Injection", "icon": "💉", "description": "Prompt injection attacks and defenses."},
    {"id": "adversarial-ml", "name": "Adversarial ML", "icon": "⚔️", "description": "Adversarial attacks on ML systems."},
    {"id": "ai-red-teaming", "name": "AI Red Teaming", "icon": "🔴", "description": "Red team methodologies for AI systems."},
    {"id": "ai-privacy", "name": "AI Privacy & Governance", "icon": "🛡️", "description": "Privacy, compliance, and governance of AI."},
    {"id": "secure-mlops", "name": "Secure MLOps", "icon": "🔧", "description": "Securing ML pipelines and operations."},
    {"id": "enterprise-ai-security", "name": "Enterprise AI Security", "icon": "🏢", "description": "Enterprise-grade AI security frameworks."},
]

LEARNING_PATHS = [
    {
        "id": "beginner-ai-security",
        "title": "AI Security Foundations",
        "description": "Start your journey into AI security with fundamental concepts, threat models, and basic defense strategies.",
        "difficulty": "beginner",
        "estimated_hours": 20,
        "topics": ["ML Basics", "Threat Modeling", "OWASP Top 10 for LLMs", "Basic Prompt Security"],
    },
    {
        "id": "intermediate-llm-defense",
        "title": "LLM Defense Engineering",
        "description": "Build practical skills in defending LLM applications against prompt injection, data leakage, and adversarial attacks.",
        "difficulty": "intermediate",
        "estimated_hours": 40,
        "topics": ["Prompt Injection Defense", "Output Filtering", "Guardrails", "RAG Security", "Token Analysis"],
    },
    {
        "id": "advanced-red-team",
        "title": "AI Red Team Specialist",
        "description": "Master advanced AI red teaming techniques, build custom attack tools, and learn enterprise-scale assessment methodologies.",
        "difficulty": "advanced",
        "estimated_hours": 60,
        "topics": ["Jailbreaking", "Model Extraction", "Membership Inference", "Supply Chain Attacks", "CTF Challenges"],
    },
]


class LearningService:

    @staticmethod
    def get_categories():
        repo = get_learning_repo()
        categories = []
        for cat in LEARNING_CATEGORIES:
            count = repo.count(filters={"category": cat["id"]})
            categories.append({**cat, "count": count})
        return categories

    @staticmethod
    def get_paths():
        return LEARNING_PATHS

    @staticmethod
    def get_resources(page=1, per_page=12, category=None, difficulty=None):
        repo = get_learning_repo()
        filters = {}
        if category:
            filters["category"] = category
        if difficulty:
            filters["difficulty"] = difficulty
        return repo.find_all(
            filters=filters,
            sort_by="created_at",
            sort_desc=True,
            page=page,
            per_page=per_page,
        )

    @staticmethod
    def get_resource(resource_id: str):
        repo = get_learning_repo()
        return repo.find_by_id(resource_id)

    @staticmethod
    def create(data: dict):
        data["title"] = sanitize_plain(data.get("title", ""), 200)
        data["content"] = sanitize_html(data.get("content", ""))
        data["excerpt"] = sanitize_plain(data.get("excerpt", ""), 500)
        if data.get("tags"):
            data["tags"] = sanitize_tags(data["tags"])
        repo = get_learning_repo()
        return repo.create(data)

    @staticmethod
    def update(resource_id: str, data: dict):
        if "title" in data:
            data["title"] = sanitize_plain(data["title"], 200)
        if "content" in data:
            data["content"] = sanitize_html(data["content"])
        if "excerpt" in data:
            data["excerpt"] = sanitize_plain(data["excerpt"], 500)
        if "tags" in data:
            data["tags"] = sanitize_tags(data["tags"])
        repo = get_learning_repo()
        return repo.update(resource_id, data)

    @staticmethod
    def delete(resource_id: str):
        repo = get_learning_repo()
        return repo.delete(resource_id)
