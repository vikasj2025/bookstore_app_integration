#!/usr/bin/env sh
set -euo pipefail

# Automated build environment bootstrap for order-service
# - Provisions Maven via wrapper
# - Validates Java 21 present (if not, continues; CI provides toolchains)

DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$DIR"

if command -v java >/dev/null 2>&1; then
  echo "Java version:" || true
  java -version || true
else
  echo "Java not found in PATH. Ensure JDK 21 is available in CI/toolchains."
fi

./mvnw -q -v || true
