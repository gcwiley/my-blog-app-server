#!/bin/bash
# scripts/deploy.sh

# wraps gcloud app deploy with a pre-flight env check and confirmation prompt:

set -euo pipefail

echo "Running pre-deploy environment check..."
bash "$(dirname "$0")/check-env.sh"

echo ""
read -rp "Deploy to Google Cloud App Engine? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y"]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo "Deploying..."
gcloud app deploy app.yaml --project=my-blog-489715

echo "Deploy complete. View logs with:"
echo "  gcloud app logs tail --project=my-blog-489715"