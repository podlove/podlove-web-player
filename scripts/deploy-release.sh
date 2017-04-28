#!/bin/sh
echo "Publishing to Github Releases"
publish-release --token $GITHUB_TOKEN --owner $CIRCLE_PROJECT_USERNAME --repo $CIRCLE_PROJECT_REPONAME --tag $CIRCLE_TAG --assets dist/* --name "Podlove Web Player"  --notes " "
