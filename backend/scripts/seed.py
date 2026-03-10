#!/usr/bin/env python3
"""
Seed script — populates Redis with sample data.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/seed.py            # seed (skips if data exists)
    python scripts/seed.py --check    # show current data counts
    python scripts/seed.py --clear    # wipe DB 4 + re-seed
"""
import os
import sys
from pathlib import Path

# Add backend dir to path so we can import the app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Auto-load .env from project root
from dotenv import load_dotenv
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path)
    print(f"   Loaded .env from {_env_path}")

from app import create_app
from app.services.article_service import ArticleService
from app.services.blog_service import BlogService
from app.services.learning_service import LearningService
from app.services.auth_service import AuthService
from app.extensions import redis_data


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Sample Data
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLES = [
    {
        "title": "Understanding LLM Prompt Injection Attacks",
        "content": (
            "<p>Prompt injection is one of the most critical vulnerabilities in LLM-powered "
            "applications. This article explores the taxonomy of prompt injection attacks, "
            "real-world examples, and practical defense strategies.</p>"
            "<h2>What is Prompt Injection?</h2>"
            "<p>Prompt injection occurs when an attacker crafts input that manipulates the "
            "behavior of an LLM beyond its intended purpose. This can lead to data "
            "exfiltration, unauthorized actions, or bypassing safety guardrails.</p>"
            "<h2>Types of Prompt Injection</h2>"
            "<ul>"
            "<li><strong>Direct Injection</strong>: Overriding system prompts with adversarial user input</li>"
            "<li><strong>Indirect Injection</strong>: Embedding malicious instructions in external data sources</li>"
            "<li><strong>Stored Injection</strong>: Persisting malicious prompts that trigger on future interactions</li>"
            "</ul>"
            "<h2>Defense Strategies</h2>"
            "<p>Effective defense requires a layered approach: input validation, output "
            "filtering, sandboxing, and continuous monitoring.</p>"
        ),
        "excerpt": "A deep dive into prompt injection vulnerabilities, attack taxonomies, and enterprise defense strategies for LLM-powered applications.",
        "category": "prompt-injection",
        "tags": ["LLM", "prompt-injection", "security", "OWASP"],
        "status": "published",
        "is_featured": True,
        "meta_title": "Understanding LLM Prompt Injection Attacks | CyberBolt",
        "meta_description": "Learn about prompt injection vulnerabilities in LLMs, attack types, and practical defense strategies.",
    },
    {
        "title": "OWASP Top 10 for LLM Applications: 2024 Edition",
        "content": (
            "<p>The OWASP Top 10 for LLM Applications provides a critical framework for "
            "understanding the most pressing security risks in AI systems. Let's break down "
            "each vulnerability and explore practical mitigations.</p>"
            "<h2>LLM01 — Prompt Injection</h2>"
            "<p>Direct and indirect prompt injection remain the #1 risk. Attackers manipulate "
            "LLM behavior through crafted inputs or poisoned external data.</p>"
            "<h2>LLM02 — Insecure Output Handling</h2>"
            "<p>Failing to sanitize LLM outputs before passing them to downstream systems "
            "can lead to XSS, SSRF, or command injection.</p>"
            "<h2>LLM03 — Training Data Poisoning</h2>"
            "<p>Malicious data introduced during training or fine-tuning can create "
            "persistent backdoors in model behavior.</p>"
        ),
        "excerpt": "A comprehensive guide to the OWASP Top 10 security risks for LLM applications, with practical mitigations for each vulnerability.",
        "category": "llm-security",
        "tags": ["OWASP", "LLM", "top-10", "security-framework"],
        "status": "published",
        "is_featured": True,
        "meta_title": "OWASP Top 10 for LLM Applications 2024 | CyberBolt",
        "meta_description": "Comprehensive breakdown of the OWASP Top 10 security risks for LLM applications.",
    },
    {
        "title": "Building Secure RAG Pipelines: A Practical Guide",
        "content": (
            "<p>Retrieval-Augmented Generation (RAG) pipelines combine the power of LLMs "
            "with external knowledge bases. However, each component introduces unique "
            "security challenges that must be addressed.</p>"
            "<h2>Security Risks in RAG</h2>"
            "<ul>"
            "<li>Document poisoning in the knowledge base</li>"
            "<li>Indirect prompt injection via retrieved context</li>"
            "<li>Data leakage through embedding similarity</li>"
            "<li>Access control bypass in multi-tenant systems</li>"
            "</ul>"
            "<h2>Securing the Pipeline</h2>"
            "<p>Implement input validation at every stage: user query → retrieval → "
            "context assembly → LLM generation → output filtering.</p>"
        ),
        "excerpt": "Learn how to build secure RAG pipelines with defense-in-depth strategies for each component.",
        "category": "ai-security",
        "tags": ["RAG", "LLM", "pipeline-security", "vector-database"],
        "status": "published",
        "is_featured": False,
        "meta_title": "Building Secure RAG Pipelines | CyberBolt",
        "meta_description": "Practical guide to securing Retrieval-Augmented Generation pipelines in production.",
    },
]

BLOG_POSTS = [
    {
        "title": "Why I Chose AI Security as a Career Path",
        "content": (
            "<p>Making the shift from traditional cybersecurity to AI security wasn't a "
            "straightforward decision. Here's my journey and what I've learned along the way.</p>"
            "<h2>The Turning Point</h2>"
            "<p>It started when I discovered that a chatbot I was pen-testing could be "
            "trivially manipulated to reveal its system prompt and internal instructions. "
            "That moment of \"wait, this changes everything\" set me on a new path.</p>"
            "<h2>What Excites Me</h2>"
            "<p>AI security sits at the intersection of machine learning, adversarial "
            "thinking, and traditional security. The attack surface is constantly evolving, "
            "and the field is young enough that individual contributors can make significant impact.</p>"
            "<h2>Advice for Newcomers</h2>"
            "<p>Start with the fundamentals — understand how ML models work before trying "
            "to break them. The OWASP Top 10 for LLMs is a great starting framework.</p>"
        ),
        "excerpt": "My journey from traditional cybersecurity to AI security, and why I believe this is the most exciting field in tech today.",
        "category": "career",
        "tags": ["career", "AI-security", "personal"],
        "status": "published",
    },
]

LEARNING_RESOURCES = [
    {
        "title": "Prompt Injection CTF Challenges",
        "description": "Hands-on capture-the-flag challenges focused on prompt injection techniques. Practice real attack scenarios in a safe environment.",
        "category": "prompt-injection",
        "resource_type": "ctf",
        "difficulty": "intermediate",
        "estimated_minutes": 120,
        "external_url": "https://gandalf.lakera.ai",
        "tags": ["CTF", "prompt-injection", "hands-on"],
        "is_free": True,
        "status": "published",
    },
    {
        "title": "Introduction to LLM Security",
        "description": "A comprehensive beginner-friendly guide to understanding security risks in large language model applications.",
        "category": "llm-security",
        "resource_type": "article",
        "difficulty": "beginner",
        "estimated_minutes": 30,
        "tags": ["LLM", "security", "beginner"],
        "is_free": True,
        "status": "published",
    },
    {
        "title": "AI Red Teaming: Advanced Techniques",
        "description": "Deep dive into advanced red team methodologies for evaluating AI systems, including jailbreaking, model extraction, and adversarial attacks.",
        "category": "ai-red-teaming",
        "resource_type": "tutorial",
        "difficulty": "advanced",
        "estimated_minutes": 180,
        "tags": ["red-team", "jailbreaking", "adversarial"],
        "is_free": True,
        "status": "published",
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Seed Functions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def show_status():
    """Show current data counts."""
    from app.models import get_articles_repo, get_blog_repo, get_learning_repo, get_users_repo
    print("\n📊 Current database contents (Redis DB 4):")
    print(f"   Articles:           {get_articles_repo().count()}")
    print(f"   Blog posts:         {get_blog_repo().count()}")
    print(f"   Learning resources: {get_learning_repo().count()}")
    print(f"   Users:              {get_users_repo().count()}")
    print()


def clear_data():
    """Flush all data in Redis DB 4 — USE WITH CAUTION."""
    from app.models import _repos
    confirm = input("⚠️  This will DELETE all data in Redis DB 4. Type 'yes' to confirm: ")
    if confirm.strip().lower() != "yes":
        print("Aborted.")
        sys.exit(0)
    redis_data.flushdb()
    _repos.clear()
    print("🗑️  Redis DB 4 flushed.")


def seed_articles():
    """Seed articles."""
    from app.models import get_articles_repo
    repo = get_articles_repo()
    existing = repo.count()
    if existing > 0:
        print(f"   ⏭  Skipping articles ({existing} already exist)")
        return
    for data in ARTICLES:
        article = ArticleService.create(data)
        print(f"   ✅ Article: {article['title']}")


def seed_blog_posts():
    """Seed blog posts."""
    from app.models import get_blog_repo
    repo = get_blog_repo()
    existing = repo.count()
    if existing > 0:
        print(f"   ⏭  Skipping blog posts ({existing} already exist)")
        return
    for data in BLOG_POSTS:
        post = BlogService.create(data)
        print(f"   ✅ Blog post: {post['title']}")


def seed_learning_resources():
    """Seed learning resources."""
    from app.models import get_learning_repo
    repo = get_learning_repo()
    existing = repo.count()
    if existing > 0:
        print(f"   ⏭  Skipping learning resources ({existing} already exist)")
        return
    for data in LEARNING_RESOURCES:
        resource = LearningService.create(data)
        print(f"   ✅ Resource: {resource['title']}")


def seed_admin():
    """Ensure admin user exists."""
    AuthService.ensure_admin_exists()
    from flask import current_app
    print(f"   ✅ Admin user: {current_app.config['ADMIN_USERNAME']}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Main
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def main():
    config_name = os.getenv("FLASK_ENV", "production")
    app = create_app(config_name)

    with app.app_context():
        if "--check" in sys.argv:
            show_status()
            return

        if "--clear" in sys.argv:
            clear_data()

        print(f"\n🌱 Seeding CyberBolt data (env={config_name})...\n")

        seed_admin()
        seed_articles()
        seed_blog_posts()
        seed_learning_resources()

        print()
        show_status()
        print("✅ Seeding complete!\n")


if __name__ == "__main__":
    main()
