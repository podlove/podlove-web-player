#!/bin/sh
echo "Publishing to Github Releases"
publish-release --token $GITHUB_TOKEN --owner $CIRCLE_PROJECT_USERNAME --repo $CIRCLE_PROJECT_REPONAME --tag $CIRCLE_TAG --assets dist/share.html,dist/embed.js,dist/share.js,dist/window.js,dist/vendor.js --name "Podlove Web Player"  --notes " "
