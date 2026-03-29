#!/bin/bash
set -e

NONCE="$1"
RESULT_FILE="agile-val-results.json"

if [ -z "$NONCE" ]; then
	echo "Usage: bash scripts/agile-validate.sh <nonce>"
	exit 1
fi

echo "=== Starting validation ==="

# Run Cypress tests
echo "--- Running Cypress E2E tests ---"
CYPRESS_OUTPUT=$(mktemp)
CYPRESS_EXIT=0
npx cypress run --browser chromium 2>&1 | tee "$CYPRESS_OUTPUT" || CYPRESS_EXIT=$?

# Write result
if [ $CYPRESS_EXIT -eq 0 ]; then
	cat <<EOF >"$RESULT_FILE"
{
  "nonce": "$NONCE",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "passed": true,
  "steps": [
    {
      "name": "cypress",
      "passed": true,
      "output": ""
    }
  ]
}
EOF
	echo "=== Validation PASSED ==="
else
	CYPRESS_FAIL_OUTPUT=$(cat "$CYPRESS_OUTPUT")
	# Escape JSON special characters
	CYPRESS_FAIL_OUTPUT=$(echo "$CYPRESS_FAIL_OUTPUT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
	cat <<EOF >"$RESULT_FILE"
{
  "nonce": "$NONCE",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "passed": false,
  "steps": [
    {
      "name": "cypress",
      "passed": false,
      "output": $CYPRESS_FAIL_OUTPUT
    }
  ]
}
EOF
	echo "=== Validation FAILED ==="
fi

rm -f "$CYPRESS_OUTPUT"
