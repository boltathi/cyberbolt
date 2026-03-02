# ─── Build stage ─────────────────────────────
FROM python:3.12-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ─── Development ─────────────────────────────
FROM base AS development

ENV FLASK_ENV=development
ENV FLASK_DEBUG=1

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload"]

# ─── Production ──────────────────────────────
FROM base AS production

RUN useradd -r -s /bin/false appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app

USER appuser

ENV FLASK_ENV=production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5000/api/v1/health || exit 1

CMD ["gunicorn", "-c", "gunicorn.conf.py", "wsgi:app"]
