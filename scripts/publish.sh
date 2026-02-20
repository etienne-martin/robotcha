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

npm publish --access public
