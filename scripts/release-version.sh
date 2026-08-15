#!/usr/bin/env bash
# Usage: bash scripts/release-version.sh 1.4.0 YOUR_ADMIN_TOKEN
# Run this once after a new version is live on both stores.

VERSION=${1:?"Usage: $0 <version> <admin_token>  e.g. $0 1.4.0 eyJhbGci..."}
TOKEN=${2:?"Usage: $0 <version> <admin_token>  e.g. $0 1.4.0 eyJhbGci..."}

echo "→ Setting backend version to $VERSION ..."
curl -s -X PUT https://api.servix.world/api/config/version \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"ios\": \"$VERSION\", \"android\": \"$VERSION\"}" | jq .

echo ""
echo "Done. Users on older builds will see the update banner on next app open."
