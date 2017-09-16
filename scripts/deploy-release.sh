#!/bin/sh

DIST_DIR=dist/
NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")
RELEASE_FILE="${NAME}-${VERSION}.tgz"

tar -zcf $RELEASE_FILE $DIST_DIR
# echo "Publishing to Github Releases"
publish-release --token $GITHUB_TOKEN --owner $CIRCLE_PROJECT_USERNAME --repo $CIRCLE_PROJECT_REPONAME --tag $CIRCLE_TAG --assets $RELEASE_FILE --name "Podlove Web Player"  --notes " "
