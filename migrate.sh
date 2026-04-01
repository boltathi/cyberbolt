#!/bin/bash
# ─── CyberBolt Migration Manager ─────────────────────────────
#
# Safe migration tool for production deployments.
# Handles Redis data backup, restore, audit, cleanup, and
# field migrations for schema-less JSON records.
#
# Usage:
#   chmod +x migrate.sh
#   ./migrate.sh backup          # Backup Redis data
#   ./migrate.sh audit           # Audit current data state
#   ./migrate.sh migrate         # Apply pending migrations
#   ./migrate.sh rollback        # Restore from latest backup
#   ./migrate.sh cleanup         # Remove orphaned/stale data
#   ./migrate.sh status          # Show migration status
#
# ──────────────────────────────────────────────────────────────

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$APP_DIR/.env"
BACKUP_DIR="$APP_DIR/backups"
MIGRATION_LOG="$APP_DIR/backups/.migration-history"

# ─── Load environment ────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
    set -a; source "$ENV_FILE"; set +a
fi

# Extract Redis password from REDIS_URL
REDIS_PASS=$(echo "${REDIS_URL:-redis://localhost:6379/0}" \
  | sed -n 's|redis://:\([^@]*\)@.*|\1|p' \
  | python3 -c "import sys,urllib.parse; print(urllib.parse.unquote(sys.stdin.read().strip()))" 2>/dev/null || true)

if [ -n "$REDIS_PASS" ]; then
    RC="redis-cli -a $REDIS_PASS --no-auth-warning"
else
    RC="redis-cli"
fi

mkdir -p "$BACKUP_DIR"

# ─── Helpers ──────────────────────────────────────────────────

log_migration() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $1" >> "$MIGRATION_LOG"
}

redis_ok() {
    if $RC ping 2>/dev/null | grep -q PONG; then
        return 0
    fi
    echo -e "${RED}❌ Redis not reachable. Check REDIS_URL in .env${NC}"
    exit 1
}

header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════
#  BACKUP
# ═══════════════════════════════════════════════════════════════
do_backup() {
    header "🔒 Redis Backup"
    redis_ok

    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/redis-$TIMESTAMP.rdb"

    # Trigger background save
    echo -e "   Triggering BGSAVE..."
    $RC BGSAVE > /dev/null 2>&1

    # Wait for save to complete
    echo -n "   Waiting for save"
    for i in {1..30}; do
        LAST=$($RC LASTSAVE 2>/dev/null)
        sleep 1
        CURR=$($RC LASTSAVE 2>/dev/null)
        if [ "$CURR" != "$LAST" ] || [ $i -eq 1 ]; then
            # Give it a moment on first check
            if [ $i -gt 2 ]; then
                break
            fi
        fi
        echo -n "."
    done
    echo ""

    # Find and copy the dump.rdb
    REDIS_DIR=$($RC CONFIG GET dir 2>/dev/null | tail -1)
    REDIS_DBFILE=$($RC CONFIG GET dbfilename 2>/dev/null | tail -1)
    SOURCE_RDB="${REDIS_DIR}/${REDIS_DBFILE}"

    if [ -f "$SOURCE_RDB" ]; then
        cp "$SOURCE_RDB" "$BACKUP_FILE"
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo -e "${GREEN}   ✅ Backup saved: $BACKUP_FILE ($SIZE)${NC}"
        log_migration "BACKUP: $BACKUP_FILE ($SIZE)"
    else
        echo -e "${YELLOW}   ⚠️  Redis RDB not found at $SOURCE_RDB${NC}"
        echo "      Saving JSON export instead..."
        do_json_backup "$TIMESTAMP"
    fi

    # Also save a JSON snapshot of article data (always useful)
    do_json_backup "$TIMESTAMP"

    # Cleanup old backups (keep last 10)
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/redis-*.rdb 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 10 ]; then
        ls -1t "$BACKUP_DIR"/redis-*.rdb | tail -n +11 | xargs rm -f
        echo -e "${YELLOW}   🧹 Pruned old backups (kept last 10)${NC}"
    fi
}

do_json_backup() {
    TS=${1:-$(date +%Y%m%d-%H%M%S)}
    JSON_FILE="$BACKUP_DIR/data-$TS.json"

    python3 -c "
import redis, json, os, urllib.parse

url = os.getenv('REDIS_DATA_URL', 'redis://localhost:6379/4')
r = redis.from_url(url, decode_responses=True)

backup = {}

# Backup articles
article_ids = r.zrange('articles:_idx', 0, -1)
backup['articles'] = []
for aid in article_ids:
    data = r.get(f'articles:{aid}')
    if data:
        backup['articles'].append(json.loads(data))

# Backup users
user_ids = r.zrange('users:_idx', 0, -1)
backup['users'] = []
for uid in user_ids:
    data = r.get(f'users:{uid}')
    if data:
        backup['users'].append(json.loads(data))

# Backup image metadata (not the base64 data — too large)
image_keys = r.keys('images:*')
backup['image_ids'] = [k.split(':')[1] for k in image_keys]

backup['_meta'] = {
    'timestamp': '$TS',
    'article_count': len(backup['articles']),
    'user_count': len(backup['users']),
    'image_count': len(backup['image_ids']),
}

with open('$JSON_FILE', 'w') as f:
    json.dump(backup, f, indent=2, default=str)

print(f'   ✅ JSON backup: $JSON_FILE ({len(backup[\"articles\"])} articles, {len(backup[\"users\"])} users, {len(backup[\"image_ids\"])} images)')
" 2>&1 | while read line; do echo -e "${GREEN}$line${NC}"; done
    log_migration "JSON_BACKUP: $JSON_FILE"
}


# ═══════════════════════════════════════════════════════════════
#  AUDIT — inspect current data state
# ═══════════════════════════════════════════════════════════════
do_audit() {
    header "🔍 Data Audit"
    redis_ok

    echo -e "${BOLD}  Collection Counts (DB 4):${NC}"
    ARTICLE_COUNT=$($RC -n 4 ZCARD articles:_idx 2>/dev/null || echo 0)
    USER_COUNT=$($RC -n 4 ZCARD users:_idx 2>/dev/null || echo 0)
    IMAGE_COUNT=$($RC -n 4 KEYS 'images:*' 2>/dev/null | wc -l | tr -d ' ')
    echo "   📝 Articles:  $ARTICLE_COUNT"
    echo "   👤 Users:     $USER_COUNT"
    echo "   🖼️  Images:    $IMAGE_COUNT"
    echo ""

    echo -e "${BOLD}  Redis DB Usage:${NC}"
    for db in 0 1 2 3 4; do
        KEYS=$($RC -n $db DBSIZE 2>/dev/null | grep -oE '[0-9]+' || echo 0)
        case $db in
            0) LABEL="Cache" ;;
            1) LABEL="Sessions" ;;
            2) LABEL="Rate limits" ;;
            3) LABEL="JWT blocklist" ;;
            4) LABEL="Data storage" ;;
        esac
        echo "   DB $db ($LABEL): $KEYS keys"
    done
    echo ""

    # Check for missing fields in articles (migration readiness)
    echo -e "${BOLD}  Article Field Audit:${NC}"
    python3 -c "
import redis, json, os

url = os.getenv('REDIS_DATA_URL', 'redis://localhost:6379/4')
r = redis.from_url(url, decode_responses=True)

article_ids = r.zrange('articles:_idx', 0, -1)
if not article_ids:
    print('   No articles found.')
    exit()

# Fields we expect in the current schema
EXPECTED = {
    'id', 'title', 'slug', 'content', 'excerpt', 'category', 'tags',
    'status', 'is_featured', 'views', 'author',
    'meta_title', 'meta_description', 'featured_image',
    'published_at', 'created_at', 'updated_at',
}

missing_report = {}
total = 0
for aid in article_ids:
    data = r.get(f'articles:{aid}')
    if not data:
        continue
    article = json.loads(data)
    total += 1
    for field in EXPECTED:
        if field not in article:
            missing_report.setdefault(field, 0)
            missing_report[field] += 1

if missing_report:
    print(f'   Checked {total} articles:')
    for field, count in sorted(missing_report.items()):
        pct = count * 100 // total
        status = '🟡' if pct < 100 else '🔴'
        print(f'     {status} \"{field}\" missing in {count}/{total} ({pct}%)')
    print()
    print('   Run \"./migrate.sh migrate\" to backfill missing fields.')
else:
    print(f'   ✅ All {total} articles have all expected fields.')
"
    echo ""

    # Check backup status
    echo -e "${BOLD}  Backups:${NC}"
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/redis-*.rdb 2>/dev/null | wc -l | tr -d ' ')
    JSON_COUNT=$(ls -1 "$BACKUP_DIR"/data-*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "   RDB backups:  $BACKUP_COUNT"
    echo "   JSON backups: $JSON_COUNT"
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        LATEST=$(ls -1t "$BACKUP_DIR"/redis-*.rdb 2>/dev/null | head -1)
        echo "   Latest:       $(basename $LATEST)"
    fi
    echo ""
}


# ═══════════════════════════════════════════════════════════════
#  MIGRATE — apply pending field migrations
# ═══════════════════════════════════════════════════════════════
do_migrate() {
    header "⚡ Running Migrations"
    redis_ok

    # Always backup before migrating
    echo -e "${YELLOW}   Creating pre-migration backup...${NC}"
    do_backup
    echo ""

    python3 -c "
import redis, json, os
from datetime import datetime, timezone

url = os.getenv('REDIS_DATA_URL', 'redis://localhost:6379/4')
r = redis.from_url(url, decode_responses=True)

migrations_applied = 0

# ──────────────────────────────────────────────
# Migration 1: Backfill 'author' field
# Added: April 2026
# Articles created before this lack the 'author' field.
# Backfill with empty string (optional field).
# ──────────────────────────────────────────────
def migrate_author_field():
    global migrations_applied
    article_ids = r.zrange('articles:_idx', 0, -1)
    count = 0
    for aid in article_ids:
        raw = r.get(f'articles:{aid}')
        if not raw:
            continue
        article = json.loads(raw)
        if 'author' not in article:
            article['author'] = ''
            article['updated_at'] = datetime.now(timezone.utc).isoformat()
            r.set(f'articles:{aid}', json.dumps(article, default=str))
            count += 1
    if count:
        print(f'   ✅ Migration 1: Added \"author\" field to {count} articles')
        migrations_applied += 1
    else:
        print(f'   ⏭️  Migration 1: \"author\" already present on all articles')

# ──────────────────────────────────────────────
# Migration 2: Backfill 'views' field
# Ensures all articles have a views counter.
# ──────────────────────────────────────────────
def migrate_views_field():
    global migrations_applied
    article_ids = r.zrange('articles:_idx', 0, -1)
    count = 0
    for aid in article_ids:
        raw = r.get(f'articles:{aid}')
        if not raw:
            continue
        article = json.loads(raw)
        if 'views' not in article:
            article['views'] = 0
            r.set(f'articles:{aid}', json.dumps(article, default=str))
            count += 1
    if count:
        print(f'   ✅ Migration 2: Added \"views\" field to {count} articles')
        migrations_applied += 1
    else:
        print(f'   ⏭️  Migration 2: \"views\" already present on all articles')

# ──────────────────────────────────────────────
# Migration 3: Backfill 'published_at' for published articles
# Old articles may have status=published but no published_at.
# ──────────────────────────────────────────────
def migrate_published_at():
    global migrations_applied
    article_ids = r.zrange('articles:_idx', 0, -1)
    count = 0
    for aid in article_ids:
        raw = r.get(f'articles:{aid}')
        if not raw:
            continue
        article = json.loads(raw)
        if article.get('status') == 'published' and not article.get('published_at'):
            article['published_at'] = article.get('created_at', datetime.now(timezone.utc).isoformat())
            r.set(f'articles:{aid}', json.dumps(article, default=str))
            count += 1
    if count:
        print(f'   ✅ Migration 3: Set \"published_at\" on {count} published articles')
        migrations_applied += 1
    else:
        print(f'   ⏭️  Migration 3: \"published_at\" already set on all published articles')

# ──────────────────────────────────────────────
# Migration 4: Backfill SEO fields
# Ensure meta_title, meta_description, featured_image exist.
# ──────────────────────────────────────────────
def migrate_seo_fields():
    global migrations_applied
    article_ids = r.zrange('articles:_idx', 0, -1)
    count = 0
    seo_fields = {'meta_title': '', 'meta_description': '', 'featured_image': ''}
    for aid in article_ids:
        raw = r.get(f'articles:{aid}')
        if not raw:
            continue
        article = json.loads(raw)
        changed = False
        for field, default in seo_fields.items():
            if field not in article:
                article[field] = default
                changed = True
        if changed:
            r.set(f'articles:{aid}', json.dumps(article, default=str))
            count += 1
    if count:
        print(f'   ✅ Migration 4: Added SEO fields to {count} articles')
        migrations_applied += 1
    else:
        print(f'   ⏭️  Migration 4: SEO fields already present on all articles')

# ──────────────────────────────────────────────
# Migration 5: Normalize tag format
# Ensure tags is always a list (not None or string).
# ──────────────────────────────────────────────
def migrate_tags_format():
    global migrations_applied
    article_ids = r.zrange('articles:_idx', 0, -1)
    count = 0
    for aid in article_ids:
        raw = r.get(f'articles:{aid}')
        if not raw:
            continue
        article = json.loads(raw)
        tags = article.get('tags')
        if tags is None:
            article['tags'] = []
            r.set(f'articles:{aid}', json.dumps(article, default=str))
            count += 1
        elif isinstance(tags, str):
            article['tags'] = [t.strip() for t in tags.split(',') if t.strip()]
            r.set(f'articles:{aid}', json.dumps(article, default=str))
            count += 1
    if count:
        print(f'   ✅ Migration 5: Fixed tags format on {count} articles')
        migrations_applied += 1
    else:
        print(f'   ⏭️  Migration 5: Tags format OK on all articles')

# ──────────────────────────────────────────────
# Run all migrations
# ──────────────────────────────────────────────
print()
migrate_author_field()
migrate_views_field()
migrate_published_at()
migrate_seo_fields()
migrate_tags_format()

print()
if migrations_applied:
    print(f'   🎉 {migrations_applied} migration(s) applied successfully!')
else:
    print(f'   ✅ All data is up to date — no migrations needed.')
print()
"

    log_migration "MIGRATE: completed"
}


# ═══════════════════════════════════════════════════════════════
#  ROLLBACK — restore from latest backup
# ═══════════════════════════════════════════════════════════════
do_rollback() {
    header "⏪ Rollback"

    # Find latest backup
    LATEST_RDB=$(ls -1t "$BACKUP_DIR"/redis-*.rdb 2>/dev/null | head -1)
    LATEST_JSON=$(ls -1t "$BACKUP_DIR"/data-*.json 2>/dev/null | head -1)

    if [ -z "$LATEST_RDB" ] && [ -z "$LATEST_JSON" ]; then
        echo -e "${RED}   ❌ No backups found in $BACKUP_DIR${NC}"
        exit 1
    fi

    echo -e "${BOLD}  Available backups:${NC}"
    echo ""
    if [ -n "$LATEST_RDB" ]; then
        echo "   RDB backups:"
        ls -1t "$BACKUP_DIR"/redis-*.rdb 2>/dev/null | head -5 | while read f; do
            SIZE=$(du -h "$f" | cut -f1)
            echo "     $(basename $f)  ($SIZE)"
        done
    fi
    echo ""
    if [ -n "$LATEST_JSON" ]; then
        echo "   JSON backups:"
        ls -1t "$BACKUP_DIR"/data-*.json 2>/dev/null | head -5 | while read f; do
            SIZE=$(du -h "$f" | cut -f1)
            echo "     $(basename $f)  ($SIZE)"
        done
    fi

    echo ""
    echo -e "${YELLOW}  Choose rollback method:${NC}"
    echo "    1) RDB restore  — Full Redis restore (stops Redis, replaces dump.rdb)"
    echo "    2) JSON restore — Re-import articles from JSON backup (Redis stays running)"
    echo "    3) Cancel"
    echo ""
    read -p "  Choice [1/2/3]: " CHOICE

    case $CHOICE in
        1)
            if [ -z "$LATEST_RDB" ]; then
                echo -e "${RED}   ❌ No RDB backups available${NC}"
                exit 1
            fi
            echo ""
            echo -e "${YELLOW}   ⚠️  This will STOP Redis, replace the data, and restart.${NC}"
            read -p "   Are you sure? (yes/no): " CONFIRM
            if [ "$CONFIRM" != "yes" ]; then
                echo "   Cancelled."
                exit 0
            fi

            REDIS_DIR=$($RC CONFIG GET dir 2>/dev/null | tail -1)
            REDIS_DBFILE=$($RC CONFIG GET dbfilename 2>/dev/null | tail -1)
            TARGET="${REDIS_DIR}/${REDIS_DBFILE}"

            echo "   Stopping Redis..."
            systemctl stop redis
            cp "$LATEST_RDB" "$TARGET"
            chown redis:redis "$TARGET" 2>/dev/null || true
            echo "   Starting Redis..."
            systemctl start redis
            sleep 2

            if $RC ping 2>/dev/null | grep -q PONG; then
                echo -e "${GREEN}   ✅ RDB restored from $(basename $LATEST_RDB)${NC}"
                log_migration "ROLLBACK_RDB: $(basename $LATEST_RDB)"
            else
                echo -e "${RED}   ❌ Redis failed to start after restore${NC}"
                exit 1
            fi
            ;;
        2)
            if [ -z "$LATEST_JSON" ]; then
                echo -e "${RED}   ❌ No JSON backups available${NC}"
                exit 1
            fi
            echo ""
            echo -e "${YELLOW}   This will re-import articles from: $(basename $LATEST_JSON)${NC}"
            read -p "   Are you sure? (yes/no): " CONFIRM
            if [ "$CONFIRM" != "yes" ]; then
                echo "   Cancelled."
                exit 0
            fi

            python3 -c "
import redis, json, os

url = os.getenv('REDIS_DATA_URL', 'redis://localhost:6379/4')
r = redis.from_url(url, decode_responses=True)

with open('$LATEST_JSON') as f:
    backup = json.load(f)

count = 0
for article in backup.get('articles', []):
    aid = article['id']
    r.set(f'articles:{aid}', json.dumps(article, default=str))
    # Rebuild sorted set index
    from datetime import datetime
    try:
        ts = datetime.fromisoformat(article.get('created_at', '')).timestamp()
    except:
        ts = datetime.now().timestamp()
    r.zadd('articles:_idx', {aid: ts})
    # Rebuild secondary indexes
    for field in ['status', 'category', 'is_featured', 'slug']:
        val = article.get(field)
        if val is not None:
            r.sadd(f'articles:_f:{field}:{val}', aid)
    count += 1

print(f'   ✅ Restored {count} articles from $(basename $LATEST_JSON)')
"
            log_migration "ROLLBACK_JSON: $(basename $LATEST_JSON)"
            ;;
        *)
            echo "   Cancelled."
            exit 0
            ;;
    esac
}


# ═══════════════════════════════════════════════════════════════
#  CLEANUP — remove orphaned data
# ═══════════════════════════════════════════════════════════════
do_cleanup() {
    header "🧹 Data Cleanup"
    redis_ok

    python3 -c "
import redis, json, os

url = os.getenv('REDIS_DATA_URL', 'redis://localhost:6379/4')
r = redis.from_url(url, decode_responses=True)

# 1. Find orphaned sorted-set entries (ID in index but no record)
print('  Checking for orphaned index entries...')
orphaned = 0
for collection in ['articles', 'users']:
    idx_key = f'{collection}:_idx'
    ids = r.zrange(idx_key, 0, -1)
    for rid in ids:
        if not r.exists(f'{collection}:{rid}'):
            r.zrem(idx_key, rid)
            orphaned += 1

if orphaned:
    print(f'   🧹 Removed {orphaned} orphaned index entries')
else:
    print(f'   ✅ No orphaned index entries')

# 2. Find orphaned secondary index entries
print('  Checking secondary indexes...')
stale = 0
filter_keys = r.keys('articles:_f:*') + r.keys('users:_f:*')
for fk in filter_keys:
    members = r.smembers(fk)
    collection = fk.split(':')[0]
    for mid in members:
        if not r.exists(f'{collection}:{mid}'):
            r.srem(fk, mid)
            stale += 1
    # Remove empty sets
    if r.scard(fk) == 0:
        r.delete(fk)

if stale:
    print(f'   🧹 Removed {stale} stale secondary index entries')
else:
    print(f'   ✅ Secondary indexes clean')

# 3. Check for unreferenced images
print('  Checking for orphaned images...')
image_keys = [k for k in r.keys('images:*')]
if image_keys:
    # Get all article content to check for image references
    article_ids = r.zrange('articles:_idx', 0, -1)
    all_content = ''
    for aid in article_ids:
        raw = r.get(f'articles:{aid}')
        if raw:
            all_content += raw

    orphan_images = []
    for ik in image_keys:
        img_id = ik.split(':')[1]
        if img_id not in all_content:
            orphan_images.append(ik)

    if orphan_images:
        print(f'   ⚠️  Found {len(orphan_images)} unreferenced images')
        print(f'      (Not auto-deleting — they may be referenced elsewhere)')
        for ik in orphan_images[:5]:
            print(f'      - {ik}')
        if len(orphan_images) > 5:
            print(f'      ... and {len(orphan_images) - 5} more')
    else:
        print(f'   ✅ All images are referenced in articles')
else:
    print(f'   ✅ No images stored')

print()
"
    log_migration "CLEANUP: completed"
}


# ═══════════════════════════════════════════════════════════════
#  STATUS — show migration history
# ═══════════════════════════════════════════════════════════════
do_status() {
    header "📋 Migration Status"

    if [ -f "$MIGRATION_LOG" ]; then
        echo -e "${BOLD}  Migration History (last 15):${NC}"
        echo ""
        tail -15 "$MIGRATION_LOG" | while read line; do
            echo "   $line"
        done
    else
        echo "   No migration history yet."
    fi

    echo ""
    echo -e "${BOLD}  Backup Inventory:${NC}"
    RDB_COUNT=$(ls -1 "$BACKUP_DIR"/redis-*.rdb 2>/dev/null | wc -l | tr -d ' ')
    JSON_COUNT=$(ls -1 "$BACKUP_DIR"/data-*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "   RDB backups:  $RDB_COUNT"
    echo "   JSON backups: $JSON_COUNT"

    if [ "$RDB_COUNT" -gt 0 ]; then
        LATEST=$(ls -1t "$BACKUP_DIR"/redis-*.rdb | head -1)
        echo "   Latest RDB:   $(basename $LATEST) ($(du -h "$LATEST" | cut -f1))"
    fi
    if [ "$JSON_COUNT" -gt 0 ]; then
        LATEST=$(ls -1t "$BACKUP_DIR"/data-*.json | head -1)
        echo "   Latest JSON:  $(basename $LATEST) ($(du -h "$LATEST" | cut -f1))"
    fi
    echo ""
}


# ═══════════════════════════════════════════════════════════════
#  MAIN — route subcommands
# ═══════════════════════════════════════════════════════════════
case "${1:-help}" in
    backup)
        do_backup
        ;;
    audit)
        do_audit
        ;;
    migrate)
        do_migrate
        ;;
    rollback)
        do_rollback
        ;;
    cleanup)
        do_cleanup
        ;;
    status)
        do_status
        ;;
    help|--help|-h)
        echo ""
        echo -e "${BOLD}CyberBolt Migration Manager${NC}"
        echo ""
        echo "Usage: ./migrate.sh <command>"
        echo ""
        echo "Commands:"
        echo "  backup     Create a Redis RDB + JSON backup"
        echo "  audit      Inspect data state and check for missing fields"
        echo "  migrate    Apply pending field migrations (auto-backups first)"
        echo "  rollback   Restore data from a backup (interactive)"
        echo "  cleanup    Find and fix orphaned index entries"
        echo "  status     Show migration history and backup inventory"
        echo ""
        echo "Safe deployment workflow:"
        echo "  1. ./migrate.sh backup       # backup current data"
        echo "  2. ./migrate.sh audit        # check what needs migrating"
        echo "  3. git pull                  # pull new code"
        echo "  4. ./migrate.sh migrate      # apply field migrations"
        echo "  5. ./deploy-contabo.sh       # deploy new code"
        echo "  6. ./migrate.sh audit        # verify everything is clean"
        echo ""
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Run ./migrate.sh help for usage."
        exit 1
        ;;
esac
