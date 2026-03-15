#!/bin/bash
# scripts/check.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "Running ESLint..."
npx eslint src/

echo "All checks passed."