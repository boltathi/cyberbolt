"""Seed script — populates sample data for development."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app

app = create_app("development")

with app.app_context():
    from app.services.article_service import ArticleService
    from app.services.blog_service import BlogService
    from app.services.learning_service import LearningService

    # ─── Articles ─────────────────────────────
    articles = [
        {
            "title": "Understanding LLM Prompt Injection Attacks",
            "content": "<p>Prompt injection is one of the most critical vulnerabilities in LLM-powered applications. This article explores the taxonomy of prompt injection attacks, real-world examples, and practical defense strategies.</p><h2>What is Prompt Injection?</h2><p>Prompt injection occurs when an attacker crafts input that manipulates the behavior of an LLM beyond its intended purpose. This can lead to data exfiltration, unauthorized actions, or bypassing safety guardrails.</p><h2>Types of Prompt Injection</h2><ul><li><strong>Direct Injection</strong>: Overriding system prompts with adversarial user input</li><li><strong>Indirect Injection</strong>: Embedding malicious instructions in external data sources</li><li><strong>Stored Injection</strong>: Persisting malicious prompts that trigger on future interactions</li></ul><h2>Defense Strategies</h2><p>Effective defense requires a layered approach: input validation, output filtering, sandboxing, and continuous monitoring.</p>",
            "excerpt": "A deep dive into prompt injection vulnerabilities, attack taxonomies, and enterprise defense strategies for LLM-powered applications.",
            "category": "prompt-injection",
            "tags": ["LLM", "prompt-injection", "security", "defense"],
            "status": "published",
            "is_featured": True,
        },
        {
            "title": "Building Secure RAG Pipelines: A Practical Guide",
            "content": "<p>Retrieval-Augmented Generation (RAG) pipelines are becoming the backbone of enterprise AI applications. But they introduce unique security challenges that traditional security frameworks don't address.</p><h2>RAG Security Threats</h2><p>From poisoned knowledge bases to context window manipulation, RAG systems face threats at every stage of the pipeline.</p><h2>Secure Architecture Patterns</h2><p>Implement defense-in-depth with input sanitization, retrieval filtering, and output verification layers.</p>",
            "excerpt": "Learn how to build RAG pipelines that are resilient against data poisoning, context manipulation, and information leakage.",
            "category": "llm-security",
            "tags": ["RAG", "LLM", "enterprise", "architecture"],
            "status": "published",
            "is_featured": True,
        },
        {
            "title": "OWASP Top 10 for LLM Applications: 2024 Edition",
            "content": "<p>The OWASP Top 10 for LLM Applications provides a critical framework for understanding the most significant security risks in AI/LLM deployments.</p><h2>The Top 10 Risks</h2><ol><li>LLM01: Prompt Injection</li><li>LLM02: Insecure Output Handling</li><li>LLM03: Training Data Poisoning</li><li>LLM04: Model Denial of Service</li><li>LLM05: Supply Chain Vulnerabilities</li><li>LLM06: Sensitive Information Disclosure</li><li>LLM07: Insecure Plugin Design</li><li>LLM08: Excessive Agency</li><li>LLM09: Overreliance</li><li>LLM10: Model Theft</li></ol>",
            "excerpt": "A comprehensive overview of the OWASP Top 10 security risks for LLM applications and how to mitigate them.",
            "category": "ai-security",
            "tags": ["OWASP", "LLM", "security", "framework"],
            "status": "published",
            "is_featured": True,
        },
    ]

    for article in articles:
        ArticleService.create(article)
    print(f"✅ Seeded {len(articles)} articles")

    # ─── Blog Posts ───────────────────────────
    posts = [
        {
            "title": "Why I Chose AI Security as a Career Path",
            "content": "<p>Three years ago, I was a general cybersecurity analyst wondering what to specialize in. Today, I lead AI security assessments for enterprise clients. Here's my journey and why I believe AI security is the most exciting field in tech.</p><p>The intersection of AI and security isn't just a niche — it's becoming the center of modern cybersecurity. Every organization deploying AI needs people who understand both the technology and its vulnerabilities.</p>",
            "excerpt": "A personal reflection on transitioning from traditional cybersecurity to AI security, and why it's the most impactful career move I've made.",
            "category": "career",
            "tags": ["career", "AI security", "personal"],
            "status": "published",
        },
    ]

    for post in posts:
        BlogService.create(post)
    print(f"✅ Seeded {len(posts)} blog posts")

    # ─── Learning Resources ───────────────────
    resources = [
        {
            "title": "Introduction to Machine Learning Security",
            "description": "A beginner-friendly guide covering fundamental concepts in ML security, including threat modeling and basic attack vectors.",
            "category": "ai-ml-fundamentals",
            "resource_type": "article",
            "difficulty": "beginner",
            "estimated_minutes": 30,
            "tags": ["ML", "fundamentals", "beginner"],
            "is_free": True,
        },
        {
            "title": "Prompt Injection CTF Challenges",
            "description": "Hands-on capture-the-flag challenges designed to teach prompt injection techniques and defenses.",
            "category": "prompt-injection",
            "resource_type": "ctf",
            "difficulty": "intermediate",
            "estimated_minutes": 120,
            "external_url": "https://gandalf.lakera.ai",
            "tags": ["CTF", "prompt-injection", "hands-on"],
            "is_free": True,
        },
        {
            "title": "Advanced AI Red Teaming Methodology",
            "description": "A comprehensive framework for conducting AI red team assessments on enterprise LLM deployments.",
            "category": "ai-red-teaming",
            "resource_type": "tutorial",
            "difficulty": "advanced",
            "estimated_minutes": 90,
            "tags": ["red-teaming", "enterprise", "methodology"],
            "is_free": True,
        },
    ]

    for resource in resources:
        LearningService.create(resource)
    print(f"✅ Seeded {len(resources)} learning resources")

    print("\n🎉 Seed complete!")
