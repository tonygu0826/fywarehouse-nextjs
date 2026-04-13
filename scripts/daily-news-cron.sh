#!/bin/bash
# Daily news auto-generation cron script
# Add to crontab: 0 13 * * * /path/to/daily-news-cron.sh
# Runs at 8:00 AM Montreal time (13:00 UTC)

SITE_URL="${SITE_URL:-https://fywarehouse.com}"
API_KEY="${NEWS_API_KEY:-}"
LOG_FILE="/var/log/fywarehouse-news-cron.log"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting daily news generation..." >> "$LOG_FILE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${SITE_URL}/api/news/generate/auto" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  --max-time 120)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] HTTP ${HTTP_CODE}: ${BODY}" >> "$LOG_FILE"

if [ "$HTTP_CODE" != "200" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: News generation failed with HTTP ${HTTP_CODE}" >> "$LOG_FILE"
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Daily news generation completed successfully" >> "$LOG_FILE"
