#!/bin/bash
# scripts/check-env.sh

# catches missing env vars before deploying — run this in CI or before gcloud app deploy:

set -euo pipefail

REQUIRED_VARS=("DB_NAME" "DB_USER" "DB_PASSWORD" "DB_HOST" "JWT_SECRET" "NODE_ENV")
MISSING=()

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "Error: Missing required environment variables:"
  for VAR in "${MISSING[@]}"; do
    echo "  - $VAR"
  done
  exit 1
fi

echo "All required environment variables are set."