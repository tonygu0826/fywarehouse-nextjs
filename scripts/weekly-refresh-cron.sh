#!/bin/bash
# Weekly content refresh cron script
# Add to crontab: 0 14 * * 0  (every Sunday at 10 AM Montreal / 14:00 UTC)

SITE_URL="${SITE_URL:-http://localhost:3001}"
API_KEY="${NEWS_API_KEY:-}"
LOG_FILE="/var/log/fywarehouse-refresh-cron.log"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting weekly content refresh..." >> "$LOG_FILE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${SITE_URL}/api/news/refresh" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"maxArticles": 10}' \
  --max-time 120)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] HTTP ${HTTP_CODE}: ${BODY}" >> "$LOG_FILE"
