# ─── CyberBolt Makefile ───────────────────────

.PHONY: dev prod build seed logs clean backup ssl shell-back shell-front test

# Development
dev:
	docker compose up -d
	@echo "🚀 Dev environment running"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:5000/api/v1/docs"

# Production
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "🚀 Production environment running"

# Build
build:
	docker compose build --no-cache

# Seed data
seed:
	docker compose exec backend python -m scripts.seed

# Logs
logs:
	docker compose logs -f

# Clean
clean:
	docker compose down -v --remove-orphans
	@echo "🧹 Cleaned up"

# Backup
backup:
	@mkdir -p backups
	tar -czf backups/data-$$(date +%Y%m%d-%H%M%S).tar.gz data/
	@echo "📦 Backup saved"

# SSL
ssl:
	bash scripts/setup-ssl.sh

# Shell access
shell-back:
	docker compose exec backend bash

shell-front:
	docker compose exec frontend sh

# Tests
test:
	docker compose exec backend python -m pytest tests/ -v
