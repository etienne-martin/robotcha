#!/bin/bash

# Exit when any command fail
set -eo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${NPM_AUTH_TOKEN:-}" ]]; then
  echo "Missing NPM_AUTH_TOKEN" 1>&2
  exit 1
fi

PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")

npm config set //registry.npmjs.org/:_authToken="${NPM_AUTH_TOKEN}" --workspaces=false

if npm view "${PACKAGE_NAME}@${PACKAGE_VERSION}" version >/dev/null 2>&1; then
  echo "$PACKAGE_NAME@$PACKAGE_VERSION is already published!"
  exit 0
fi

TMP_PACKAGE_JSON=$(mktemp)
cp package.json "${TMP_PACKAGE_JSON}"

cleanup() {
  mv "${TMP_PACKAGE_JSON}" package.json
}

trap cleanup EXIT

node - <<'NODE'
const fs = require('fs');
const path = 'package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
delete pkg.dependencies;
fs.writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
NODE

npm publish --access public
